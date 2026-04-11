import express from "express";
import cors from "cors";
import db from "./db.js";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ML Prediction function
async function checkML({
  sender,
  receiver,
  amount,
  sender_balance,
  is_new_receiver,
}) {
  try {
    const res = await axios.post("http://localhost:8000/predict", {
      amount: amount,
      sender_balance: sender_balance,
      is_new_receiver: is_new_receiver,
    });

    const risk = res.data.risk;
    const score = res.data.score;

    console.log("ML Prediction:", risk);

    if (risk === "Medium Risk") return { status: "medium_risk", score };
    if (risk === "High Risk") return { status: "high_risk", score };

    return { status: "normal", score };

  } catch (err) {
    console.log("ML API error:", err.message);
    return { status: "normal" };
  }
}

const app = express();
const otpStore = {};

app.use(cors());
app.use(express.json());

// NEW: Fraud dataset list
let fraudUpis = [];

// Load fraud dataset
fs.createReadStream("../ml_service/fraud_dataset.csv")
  .pipe(csv())
  .on("data", (row) => {
    fraudUpis.push(row.upi_id);
  })
  .on("end", () => {
    console.log("Fraud dataset loaded:", fraudUpis);
  });

// Test route
app.get("/", (req, res) => {
  res.send("UPI Fraud Detection Backend Running");
});

// Register User API
const generateUpiId = (email) => {
  const name = email.split("@")[0];
  return name.toLowerCase() + "@upi";
};

// Register user in backend
app.post("/register", async (req, res) => {
  const { name, email, phone, location } = req.body;

  const upiId = generateUpiId(email);
  console.log("API HIT:", req.body);

  try {
    // check if user exists
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    // create new user
await db.query(
  `INSERT INTO users 
   (name, email, phone, location, upiId, balance, created_at) 
   VALUES (?, ?, ?, ?, ?, ?, NOW())`,
  [
    name,
    email,
    phone || null,
    location || null,
    upiId,
    10000,
  ]
);

    res.json({
      message: "User created",
      upiId,
      balance: 10000,
    });
    console.log("User inserted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send Money API
app.post("/send-money", async (req, res) => {
  const { sender, receiver, amount } = req.body;

  try {
    const amt = Number(amount);

    // =========================
    // BASIC VALIDATION
    // =========================
    if (!sender || !receiver || !amt || amt <= 0) {
      return res.json({ status: "failed", message: "Invalid input" });
    }

    if (sender === receiver) {
      return res.json({
        status: "failed",
        message: "Cannot send money to yourself",
      });
    }

    // =========================
    // CSV FRAUD CHECK
    // =========================
    if (fraudUpis.includes(receiver.toLowerCase().trim())) {
      await db.query(
        "INSERT INTO transactions (sender, receiver, amount, time, status, reason) VALUES (?, ?, ?, NOW(), ?, ?)",
        [sender, receiver, amt, "blocked", "Receiver is suspicious"],
      );

      return res.json({
        status: "blocked",
        message: "Transaction blocked",
        reason: "Receiver is suspicious",
      });
    }

    // =========================
    // FETCH USERS
    // =========================
    const [senderUser] = await db.query("SELECT * FROM users WHERE upiId = ?", [
      sender,
    ]);
    const [receiverUser] = await db.query(
      "SELECT * FROM users WHERE upiId = ?",
      [receiver],
    );

    if (senderUser.length === 0)
      return res.json({ status: "failed", message: "Sender not found" });

    if (receiverUser.length === 0)
      return res.json({ status: "failed", message: "Receiver not found" });

    const senderData = senderUser[0];
    const senderBalance = senderData.balance;

    if (senderBalance < amt) {
      return res.json({
        status: "failed",
        message: "Insufficient balance",
      });
    }

    // =========================
    // CHECK IF NEW RECEIVER
    // =========================
    const [prevTransactions] = await db.query(
      "SELECT * FROM transactions WHERE sender = ? AND receiver = ?",
      [sender, receiver],
    );

    const is_new_receiver = prevTransactions.length === 0 ? 1 : 0;

    // =========================
    // ML CHECK
    // =========================
    let mlResult = { status: "normal" };

    try {
      mlResult = await checkML({
        sender,
        receiver,
        amount: amt,
        sender_balance: senderBalance, // ✅ FIXED
        is_new_receiver,
      });
    } catch (err) {
      console.log("ML error:", err.message);
    }

    // =========================
    // ML DECISION
    // =========================

    //  Medium + High Risk → OTP
    if (
      amt > 0.5 * senderBalance ||
      mlResult.status === "medium_risk" ||
      mlResult.status === "high_risk"
    ) {
      const otp = Math.floor(100000 + Math.random() * 900000);

      otpStore[sender] = {
        otp,
        sender,
        receiver,
        amount: amt,
        time: Date.now(),
      };

      console.log("OTP generated:", otp);

      return res.json({
        status: "otp_required",
        message: "OTP required (ML Risk)",
        otp,
        riskScore: mlResult.score,
      });
    }

    // =========================
    // NORMAL TRANSACTION (LOW RISK)
    // =========================

    await db.query("UPDATE users SET balance = balance - ? WHERE upiId = ?", [
      amt,
      sender,
    ]);

    await db.query("UPDATE users SET balance = balance + ? WHERE upiId = ?", [
      amt,
      receiver,
    ]);

    await db.query(
      "INSERT INTO transactions (sender, receiver, amount, time, status, reason) VALUES (?, ?, ?, NOW(), ?, ?)",
      [sender, receiver, amt, "success", "ML: Low risk transaction"],
    );

    io.to(sender).emit("balanceUpdated");
    io.to(receiver).emit("balanceUpdated");
    io.to(receiver).emit("paymentReceived", {
      sender,
      amount: amt,
    });

    return res.json({
      status: "success",
      message: "Transaction successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "failed",
      message: "Server error",
    });
  }
});

// Fetch user profile
app.get("/api/user/profile/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        name,
        email,
        phone,
        upiId,
        location,
        DATE_FORMAT(created_at, '%b %Y') AS joinDate
      FROM users
      WHERE upiId = ?
      `,
      [upiId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Profile fetch error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Fetch all transactions (for admin)
app.get("/transactions", (req, res) => {
  const sql = "SELECT * FROM transactions ORDER BY time DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});

// Fetch transactions for a specific user
app.get("/transactions/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const [data] = await db.query(
      "SELECT * FROM transactions WHERE sender = ? OR receiver = ? ORDER BY time DESC",
      [upiId, upiId],
    );

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Dashboard stats API
app.get("/dashboard-stats/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM transactions 
       WHERE sender = ? OR receiver = ?
       ORDER BY time DESC`,
      [upiId, upiId]
    );

    const today = new Date().toDateString();

    const todayTransactions = rows.filter(
      (txn) => new Date(txn.time).toDateString() === today
    );

    const successful = rows.filter(
      (txn) => txn.status === "success"
    );

    const blocked = rows.filter(
      (txn) => txn.status === "blocked"
    );

    const sentTodayAmount = todayTransactions
      .filter((txn) => txn.sender === upiId)
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    res.json({
      totalTransactions: rows.length,
      todayTransactions: todayTransactions.length,
      successfulTransactions: successful.length,
      blockedTransactions: blocked.length,
      todaySpent: sentTodayAmount,
      recentTransactions: rows.slice(0, 5),
    });
  } catch (err) {
    console.log("Dashboard stats error:", err);
    res.status(500).json({
      message: "Error fetching dashboard stats",
    });
  }
});

//NEW API
app.get("/users", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM users");
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Fetch user by UPI ID
app.get("/user/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const [user] = await db.query(
      "SELECT * FROM users WHERE upiId = ?",
      [upiId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found",
        balance: 0,
      });
    }

    res.json(user[0]);
  } catch (err) {
    console.log("User fetch error:", err);
    res.status(500).json({
      message: "Error fetching user",
      balance: 0,
    });
  }
});

// Update user profile
app.put("/user/:upiId", async (req, res) => {
  const { upiId } = req.params;
  const { phone, location } = req.body;

  try {
    await db.query(
      "UPDATE users SET phone = ?, location = ? WHERE upiId = ?",
      [phone, location, upiId]
    );

    res.json({
      message: "Profile updated",
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
    });
  }
});

// Fetch user by EMAIL
app.get("/user/email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.json({ message: "User not found" });
    }

    res.json(user[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fraud transactions API
app.get("/fraud-transactions", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE status = 'blocked' ORDER BY time DESC",
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching fraud transactions" });
  }
});

// OTP Verification API
app.post("/verify-otp", async (req, res) => {
  const { sender, otp } = req.body;

  const data = otpStore[sender];

  // ❌ No OTP found
  if (!data) {
    return res.json({
      status: "failed",
      message: "No OTP request found",
    });
  }

  // ❌ Wrong OTP
  if (Number(otp) !== data.otp) {
    return res.json({
      status: "failed",
      message: "Invalid OTP",
    });
  }

  try {
    // =========================
    // EXECUTE TRANSACTION
    // =========================

    // 🔻 Deduct sender balance
    await db.query("UPDATE users SET balance = balance - ? WHERE upiId = ?", [
      data.amount,
      data.sender,
    ]);

    // 🔺 Add receiver balance
    await db.query("UPDATE users SET balance = balance + ? WHERE upiId = ?", [
      data.amount,
      data.receiver,
    ]);

    // =========================
    // SAVE TRANSACTION (UPDATED)
    // =========================

    await db.query(
      "INSERT INTO transactions (sender, receiver, amount, time, status, reason) VALUES (?, ?, ?, NOW(), ?, ?)",
      [
        data.sender,
        data.receiver,
        data.amount,
        "success",
        "High amount - OTP verified",
      ],
    );

    io.to(data.sender).emit("balanceUpdated");
    io.to(data.receiver).emit("balanceUpdated");
    io.to(data.receiver).emit("paymentReceived", {
      sender: data.sender,
      amount: data.amount,
    });

    // =========================
    // CLEANUP
    // =========================

    delete otpStore[sender];

    // =========================
    // RESPONSE
    // =========================

    return res.json({
      status: "success",
      message: "Transaction successful",
    });
  } catch (err) {
    console.log("OTP Transaction Error:", err);

    return res.status(500).json({
      status: "failed",
      message: "Server error",
    });
  }
});

const PORT = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (upiId) => {
    socket.join(upiId);
    console.log(`✅ ${upiId} joined room`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

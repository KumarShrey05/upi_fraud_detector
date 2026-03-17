import express from "express";
import cors from "cors";
import db from "./db.js";

import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

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

app.post("/register", async (req, res) => {
  const { name, email } = req.body;

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
      "INSERT INTO users (name, email, upiId, balance) VALUES (?, ?, ?, ?)",
      [name, email, upiId, 10000],
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

  console.log("API HIT");
  console.log("Sender:", sender);
  console.log("Receiver:", receiver);
  console.log("Amount:", amount);

  try {
    const amt = Number(amount);

    // ❗ invalid amount check
    if (!amt || amt <= 0) {
      return res.json({ message: "Invalid amount" });
    }

    // 🔍 sender check
    const [senderUser] = await db.query("SELECT * FROM users WHERE upiId = ?", [
      sender,
    ]);

    if (senderUser.length === 0) {
      return res.json({ message: "Sender not found" });
    }

    // 🔍 receiver check
    const [receiverUser] = await db.query(
      "SELECT * FROM users WHERE upiId = ?",
      [receiver],
    );

    if (receiverUser.length === 0) {
      return res.json({ message: "Receiver not found" });
    }

    const senderData = senderUser[0];
    const receiverData = receiverUser[0];

    // 💰 balance check
    if (senderData.balance < amt) {
      return res.json({ message: "Insufficient balance" });
    }

    // 🔥 TRANSACTION START

    // 1️⃣ Deduct sender
    await db.query("UPDATE users SET balance = balance - ? WHERE upiId = ?", [
      amt,
      sender,
    ]);

    // 2️⃣ Add receiver
    await db.query("UPDATE users SET balance = balance + ? WHERE upiId = ?", [
      amt,
      receiver,
    ]);

    // 3️⃣ Insert transaction
    await db.query(
      "INSERT INTO transactions (sender, receiver, amount, time) VALUES (?, ?, ?, NOW())",
      [sender, receiver, amt],
    );

    console.log("Transaction successful");

    res.json({
      message: "Transaction successful",
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/transactions", (req, res) => {
  const sql = "SELECT * FROM transactions ORDER BY time DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});

app.get("/transactions/:upiId", async (req, res) => {
  const { upiId } = req.params;

  try {
    const [data] = await db.query(
      "SELECT * FROM transactions WHERE sender = ? OR receiver = ? ORDER BY time DESC",
      [upiId, upiId]
    );

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching transactions" });
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

app.get("/user/:email", async (req, res) => {
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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("UPI Fraud Detection Backend Running");
});

// Register User API
app.post("/register", (req, res) => {
  const { name, email } = req.body;

  const upiId = name.toLowerCase() + "@upi";
  const balance = 10000;

  const sql = "INSERT INTO users (name,email,upiId,balance) VALUES (?,?,?,?)";

  db.query(sql, [name, email, upiId, balance], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      message: "User registered successfully",
      upiId: upiId,
    });
  });
});

// Send Money API
app.post("/send-money", (req, res) => {
  const { senderUpi, receiverUpi, amount } = req.body;

  const transferAmount = Number(amount);

  const findSender = "SELECT * FROM users WHERE upiId=?";

  db.query(findSender, [senderUpi], (err, senderResult) => {
    if (senderResult.length === 0) {
      return res.json({ message: "Sender not found" });
    }

    const sender = senderResult[0];

    const findReceiver = "SELECT * FROM users WHERE upiId=?";

    db.query(findReceiver, [receiverUpi], (err, receiverResult) => {
      if (receiverResult.length === 0) {
        return res.json({ message: "Receiver not found" });
      }

      const receiver = receiverResult[0];

      if (sender.balance < transferAmount) {
        return res.json({ message: "Insufficient balance" });
      }

      const updateSender =
        "UPDATE users SET balance = balance - ? WHERE upiId=?";

      db.query(updateSender, [transferAmount, senderUpi]);

      const updateReceiver =
        "UPDATE users SET balance = balance + ? WHERE upiId=?";

      db.query(updateReceiver, [transferAmount, receiverUpi]);

      const storeTransaction =
        "INSERT INTO transactions (sender,receiver,amount,time) VALUES (?,?,?,NOW())";

      db.query(storeTransaction, [senderUpi, receiverUpi, transferAmount]);

      res.json({
        message: "Transaction successful",
      });
    });
  });
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

//NEW API
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

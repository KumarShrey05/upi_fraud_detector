import express from "express";
import cors from "cors";
import db from "./db.js";

// NEW IMPORTS
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";

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

  db.query(findSender, [senderUpi], async (err, senderResult) => {
    if (senderResult.length === 0) {
      return res.json({ message: "Sender not found" });
    }

    const sender = senderResult[0];

    const findReceiver = "SELECT * FROM users WHERE upiId=?";

    db.query(findReceiver, [receiverUpi], async (err, receiverResult) => {
      if (receiverResult.length === 0) {
        return res.json({ message: "Receiver not found" });
      }

      const receiver = receiverResult[0];

      if (sender.balance < transferAmount) {
        return res.json({ message: "Insufficient balance" });
      }

      // NEW: Blocklist Fraud Check
      if (fraudUpis.includes(receiverUpi)) {
        return res.json({
          message: "Transaction Blocked: Receiver in Fraud Dataset",
        });
      }

      try {
        // NEW: ML Fraud Check
        const mlResponse = await axios.post("http://localhost:8000/predict", {
          amount: transferAmount,
          sender_balance: sender.balance,
          is_new_receiver: 0,
        });

        const risk = mlResponse.data.risk;

        if (risk === "High Risk") {
          return res.json({
            message: "Transaction Blocked: High Fraud Risk",
          });
        }
      } catch (error) {
        console.log("ML Service Error");
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
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Temporary user storage
let users = [];
let transactions = [];

// Test route
app.get("/", (req, res) => {
  res.send("UPI Fraud Detection Backend Running");
});

// Register User API
app.post("/register", (req, res) => {

  const { name, email } = req.body;

  const upiId = email.split("@")[0] + "@upi";

  const newUser = {
    name: name,
    email: email,
    upiId: upiId,
    balance: 10000
  };

  users.push(newUser);

  res.json({
    message: "User Registered",
    user: newUser
  });

});

// Send Money API
app.post("/send-money", (req, res) => {

  const { senderUpi, receiverUpi, amount } = req.body;

  const sender = users.find(user => user.upiId === senderUpi);
  const receiver = users.find(user => user.upiId === receiverUpi);

  if (!sender) {
    return res.json({ message: "Sender not found" });
  }

  if (!receiver) {
    return res.json({ message: "Receiver not found" });
  }

  if (sender.balance < amount) {
    return res.json({ message: "Insufficient balance" });
  }

  sender.balance -= amount;
  receiver.balance += amount;

  const transaction = {
    sender: senderUpi,
    receiver: receiverUpi,
    amount: amount,
    time: new Date()
  };

  transactions.push(transaction);

  res.json({
    message: "Transaction Successful",
    senderBalance: sender.balance
  });

});

app.get("/transactions", (req, res) => {
  res.json(transactions);
});

//NEW API
app.get("/users", (req, res) => {
  res.json(users);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
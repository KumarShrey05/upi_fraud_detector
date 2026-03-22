"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { io } from "socket.io-client";

export default function Transactions() {
  const { user, isLoaded } = useUser();
  const [transactions, setTransactions] = useState([]);

  // Register user in backend
useEffect(() => {
  if (!user) return;

  const socket = io("http://localhost:5000");

  const upiId =
    user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

  // join room
  socket.emit("join", upiId);

  const fetchTransactions = () => {
    fetch(`http://localhost:5000/transactions/${upiId}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.log(err));
  };

  // first load
  fetchTransactions();

  // real-time update
  socket.on("balanceUpdated", () => {
    console.log("🔄 Transactions updating...");
    fetchTransactions();
  });

  return () => socket.disconnect();
}, [user]);

  // Fetch transactions for the user
  useEffect(() => {
    if (!isLoaded || !user) return;

    const upiId =
      user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

    fetch(`http://localhost:5000/transactions/${upiId}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.log(err));
  }, [isLoaded, user]);

  const getCurrentUpi = () => {
    if (!user) return "";
    return user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Navbar />

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Transaction History
        </h1>
        <p className="text-gray-500">
          Track all your payments & activity
        </p>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500">
            No transactions yet 🚫
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((txn, index) => {
              const userUpi = getCurrentUpi();
              const isSent = txn.sender === userUpi;

              // 🔥 STATUS LOGIC
              const isBlocked = txn.status === "blocked";

              // 🔥 LABEL
              const label = isBlocked
                ? "Blocked"
                : isSent
                ? "Sent"
                : "Received";

              // 🔥 AMOUNT SIGN
              const amountSign = isBlocked
                ? ""
                : isSent
                ? "-"
                : "+";

              // 🔥 COLOR
              const amountColor = isBlocked
                ? "text-gray-500"
                : isSent
                ? "text-red-500"
                : "text-green-600";

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Left */}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {isBlocked
                        ? txn.receiver
                        : isSent
                        ? `To ${txn.receiver}`
                        : `From ${txn.sender}`}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(txn.time).toLocaleString()}
                    </p>

                    {/* 🔥 REASON */}
                    {txn.reason && (
                      <p className="text-xs text-gray-400 mt-1">
                        {txn.reason}
                      </p>
                    )}
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className={`text-lg font-bold ${amountColor}`}>
                      {amountSign} ₹
                      {Number(txn.amount).toLocaleString("en-IN")}
                    </p>

                    {/* 🔥 STATUS BADGE */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        txn.status === "success"
                          ? "bg-green-100 text-green-700"
                          : txn.status === "blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
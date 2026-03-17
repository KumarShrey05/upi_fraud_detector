"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";

export default function Transactions() {
  const { user, isLoaded } = useUser();
  const [transactions, setTransactions] = useState([]);

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
              const isSent = txn.sender === getCurrentUpi();

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Left */}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {isSent ? "To" : "From"}{" "}
                      {isSent ? txn.receiver : txn.sender}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(txn.time).toLocaleString()}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isSent ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {isSent ? "-" : "+"} ₹{txn.amount}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isSent ? "Sent" : "Received"}
                    </p>
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
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [frauds, setFrauds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/fraud-transactions")
      .then((res) => res.json())
      .then((data) => setFrauds(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <Navbar />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
         Fraud Monitoring Dashboard
        </h1>
        <p className="text-gray-500">
          Track suspicious and blocked transactions
        </p>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {frauds.length === 0 ? (
          <p className="text-center text-gray-500">
            No suspicious activity 🎉
          </p>
        ) : (
          <div className="space-y-4">
            {frauds.map((txn, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 rounded-xl bg-red-50 hover:bg-red-100 transition"
              >
                {/* Left */}
                <div>
                  <p className="font-semibold text-gray-800">
                    {txn.sender} → {txn.receiver}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(txn.time).toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    {txn.reason}
                  </p>
                </div>

                {/* Right */}
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    ₹{Number(txn.amount).toLocaleString("en-IN")}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      txn.status === "blocked"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SendMoney() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const { user } = useUser();

  const handleSend = async () => {
    console.log("🔥 BUTTON CLICKED");
    if (!user) {
      alert("User not loaded");
      return;
    }

    // sender UPI ID generate
    const sender =
      user?.primaryEmailAddress?.emailAddress.split("@")[0] + "@upi";

    if (!receiver || !amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/send-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: sender,
          receiver: receiver,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      console.log("Response:", data);

      if (res.ok) {
        alert("✅ Transaction Successful");
      } else {
        alert(data.error || "Transaction failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Send Money
      </h1>

      <input
        type="text"
        placeholder="Receiver UPI ID"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        className="w-full border border-gray-400 rounded-lg p-3 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-700 text-gray-700"
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-700 text-gray-800"
      />

      <button
        type="button"
        onClick={handleSend}
        className="w-full mt-5 bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 transition"
      >
        Send
      </button>

      {message && (
        <p
          className={`mt-5 text-center font-medium ${
            status === "success"
              ? "text-green-600"
              : status === "warning"
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

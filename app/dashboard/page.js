"use client";

import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useUser();

  // Register user in backend
  useEffect(() => {
    if (user) {
      fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />

      {/* Welcome Text */}
      <h1 className="text-2xl font-semibold mb-2 text-gray-600">
        Welcome {user?.primaryEmailAddress?.emailAddress}
      </h1>

      <h1 className="text-3xl font-bold mb-6 text-gray-500">
        Dashboard
      </h1>

      {/* Balance Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-80 mb-6">
        <h2 className="text-lg font-semibold text-gray-600">
          Available Balance
        </h2>

        <p className="text-3xl font-bold text-green-600 mt-2">
          ₹10,000
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Send Money
        </button>

        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg">
          Transactions
        </button>
      </div>
    </div>
  );
}
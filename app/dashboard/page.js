"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [balance, setBalance] = useState(0);
  const router = useRouter();
  const [qr, setQr] = useState("");

  // Register user in backend
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      console.log("User not loaded yet");
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;

    if (!email) {
      console.log("Email not found");
      return;
    }

    console.log("🔥 Registering user:", email);

    const register = async () => {
      try {
        const res = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: user.fullName || "User",
          }),
        });

        const data = await res.json();
        console.log("✅ Response:", data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    register();
  }, [isLoaded, user]);

  useEffect(() => {
    if (!user) return;

    const upiId = user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

    QRCode.toDataURL(upiId)
      .then((url) => setQr(url))
      .catch((err) => console.log(err));
  }, [user]);

useEffect(() => {
  if (!isLoaded || !user) return;

  const upiId = user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

  const fetchBalance = () => {
    fetch(`http://localhost:5000/user/${upiId}`)
      .then((res) => res.json())
      .then((data) => {
        setBalance(data.balance);
      })
      .catch((err) => console.log(err));
  };

  fetchBalance(); // first call

  const interval = setInterval(fetchBalance, 1000);

  return () => clearInterval(interval); // cleanup
}, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />

      {/* Welcome Text */}
      <h1 className="text-2xl font-semibold mb-2 text-gray-600">
        Welcome {user?.primaryEmailAddress?.emailAddress}
      </h1>

      <h1 className="text-3xl font-bold mb-6 text-gray-500">Dashboard</h1>

      {/* Balance Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-80 mb-6 hover:shadow-2xl hover:scale-105 transition duration-300">
        <p className="text-sm text-gray-500 mb-2 text-center">
          {user?.primaryEmailAddress?.emailAddress.split("@")[0] + "@upi"}
        </p>
        <h2 className="text-lg font-semibold text-gray-600 text-center">
          Available Balance
        </h2>
        {qr && (
          <div className="mt-6 flex flex-col items-center">
            <p className="text-gray-600 mb-2 font-medium">Scan to Pay</p>

            <Image
              src={qr}
              alt="QR Code"
              width={160}
              height={160}
              className="rounded-lg shadow-md"
            />

            <p className="text-sm text-gray-500 mt-2">Your UPI QR</p>
          </div>
        )}
        <p className="text-3xl font-bold text-green-600 mt-2 text-center">
          ₹{Number(balance).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/send-money")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition duration-300 ease-in-out"
        >
          Send Money
        </button>

        <button
          onClick={() => router.push("/transactions")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition duration-300 ease-in-out"
        >
          Transactions
        </button>
      </div>
    </div>
  );
}

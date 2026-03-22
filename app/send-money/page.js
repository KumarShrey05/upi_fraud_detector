"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";

export default function SendMoney() {
  const { user } = useUser();
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const searchParams = useSearchParams();
  const wrapperRef = useRef(null);
  const [riskScore, setRiskScore] = useState(null);

  // Load UPI from QR params
  useEffect(() => {
    const receiverFromQR = searchParams.get("receiver");
    if (receiverFromQR) setReceiver(receiverFromQR);
  }, [searchParams]);

  // Load recent UPI suggestions
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recentUpi")) || [];
    setSuggestions(data);
  }, []);

  // Save recent UPI
  const saveRecent = (upi) => {
    let list = JSON.parse(localStorage.getItem("recentUpi")) || [];
    list = list.filter((item) => item !== upi); // remove duplicate
    list.unshift(upi); // add on top
    list = list.slice(0, 5); // limit 5
    localStorage.setItem("recentUpi", JSON.stringify(list));
    setSuggestions(list);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSend() {
    if (!user) return alert("User not loaded");

    const sender = user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

    if (!receiver || !amount) return alert("Please fill all fields");
    const senderBalance = user.balance;

    try {
      const res = await fetch("http://localhost:5000/send-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          receiver,
          amount: Number(amount),
          sender_balance: senderBalance,
        }),
      });

      let data;

      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        console.log("NON-JSON RESPONSE:", text);
        throw new Error("Server returned invalid response");
      }

      // Save receiver regardless of transaction status
      saveRecent(receiver);

      if (data.status === "otp_required") {
        setShowOtp(true);
        setGeneratedOtp(data.otp);
        setRiskScore(data.riskScore);
        return;
      }

      if (data.status === "success") {
        showToast("Transaction successful", "success");
        new Audio("/sucess.mp3").play().catch(() => {});
      } else if (data.status === "warning") {
        showToast(data.reason, "warning");
        new Audio("/sucess.mp3").play().catch(() => {});
      } else if (data.status === "blocked") {
        showToast(data.reason, "error");
        new Audio("/failed.mp3").play().catch(() => {});
      } else {
        showToast(data.message || "Transaction failed", "error");
      }

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  const handleVerifyOtp = async () => {
    if (!user) return;

    const sender = user.primaryEmailAddress.emailAddress.split("@")[0] + "@upi";

    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, otp: Number(otp) }),
      });

      const data = await res.json();

      if (data.status === "success") {
        showToast("Transaction successful", "success");
        new Audio("/sucess.mp3").play().catch(() => {});
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      showToast("Error verifying OTP", "error");
      new Audio("/failed.mp3").play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-6 m-20">
        <div
          ref={wrapperRef}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Send Money
          </h2>

          {/* Receiver Input */}
          <div className="mb-4">
            <label className="block text-gray-600 text-sm mb-1">
              Receiver UPI ID
            </label>
            <input
              type="text"
              placeholder="example@upi"
              value={receiver}
              onChange={(e) => {
                const value = e.target.value;
                setReceiver(value);

                // Fetch fresh list & filter
                const allRecent =
                  JSON.parse(localStorage.getItem("recentUpi")) || [];
                const match = allRecent.filter((upi) =>
                  upi.toLowerCase().includes(value.toLowerCase()),
                );
                setSuggestions(match);
                setShowSuggestions(match.length > 0);
              }}
              onFocus={() => {
                const allRecent =
                  JSON.parse(localStorage.getItem("recentUpi")) || [];
                setSuggestions(allRecent);
                setShowSuggestions(allRecent.length > 0);
              }}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
            />

            {/* Suggestions */}
            {showSuggestions && (
              <div className="mt-2 bg-white rounded-lg p-2 shadow-md border">
                {suggestions.map((upi, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setReceiver(upi);
                      setShowSuggestions(false);
                    }}
                    className="cursor-pointer text-sm text-blue-600 hover:bg-blue-100 px-2 py-1 rounded flex justify-between"
                  >
                    <span>{upi}</span>
                    <span className="text-gray-400 text-xs">Suggestions</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-gray-600 text-sm mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-600"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSend}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:scale-105 transition transform"
          >
            Send Money
          </button>

          {/* OTP Modal */}
          {showOtp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeOverlay" />
              <div className="relative bg-white w-[380px] rounded-2xl shadow-2xl p-6 animate-scaleIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  OTP Verification
                </h2>
                {riskScore !== null && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Risk: {riskScore}%
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          riskScore > 60
                            ? "bg-red-500"
                            : riskScore > 30
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  Secure your transaction with OTP
                </p>
                <div className="bg-indigo-50 text-indigo-600 text-sm p-2 rounded-md text-center mb-4">
                  OTP:{" "}
                  <span className="font-bold tracking-widest">
                    {generatedOtp}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-150"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setShowOtp(false);
                      router.push("/dashboard");
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div
className={`w-full px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-toast ${
  toast.type === "success"
    ? "bg-green-600"
    : toast.type === "warning"
      ? "bg-yellow-500"
      : "bg-red-600"
}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let scanner;
    let isScanning = false;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode("reader");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          async (decodedText) => {
            if (!isScanning) return;

            isScanning = false;

            console.log("Scanned:", decodedText);

            // 🔊 Beep sound
            const audio = new Audio("/beep.mp3");
            audio.play().catch(() => { });

            try {
              if (scanner && scanner.isScanning) {
                await scanner.stop();
              }
            } catch { }

            router.push(
              `/send-money?receiver=${encodeURIComponent(decodedText)}`
            );
          }
        );

        isScanning = true;
        setLoading(false);
      } catch (err) {
        console.log("Scanner error:", err);
      }
    };

    setTimeout(startScanner, 400);

    return () => {
      isScanning = false;

      if (scanner && scanner.isScanning) {
        scanner.stop().catch(() => { });
      }
    };
  }, []);

return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <Navbar />

      <div className="max-w-md mx-auto mt-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Scan QR Code
        </h1>

        {/* 🔥 Scanner Box */}
        <div className="flex justify-center">
          <div className="relative w-[360px] h-[260px] rounded-xl shadow-xl bg-black">

            {/* Camera */}
            <div id="reader" className="absolute inset-0"></div>

            {/* Loading */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm">
                ⏳ Opening Camera...
              </div>
            )}

            {/* Frame Border */}
            <div className="absolute w-[362px] h-[272px] inset-0 border-3 border-amber-950 pointer-events-none"></div>

            {/* 🔴 Scan Line */}
            <div className="absolute inset-0 flex justify-center pointer-events-none">
              <div className="absolute w-[220px] h-[2px] bg-red-500 scan-line"></div>
            </div>

          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Align QR inside frame
        </p>
      </div>
    </div>
  );
}
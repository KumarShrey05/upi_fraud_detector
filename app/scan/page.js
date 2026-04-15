"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/Bottom-nav";
import { ArrowLeft, Camera, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScanQRPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scanMode, setScanMode] = useState("camera");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  const parseQR = (text) => {
    const pa = text.match(/pa=([^&]+)/i)?.[1];
    const pn = text.match(/pn=([^&]+)/i)?.[1];

    return {
      upiId: decodeURIComponent(pa || text),
      name: decodeURIComponent(
        pn || (pa ? pa.split("@")[0] : "Merchant")
      ),
    };
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch { }
  };

  const onScanSuccess = async (decodedText) => {
    setScannedData(parseQR(decodedText));
    new Audio("/beep.mp3").play().catch(() => { });
    await stopCamera();
    setCameraStarted(false);
  };

  const startCamera = async () => {
    try {
      setLoading(true);
      setCameraStarted(true);

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras?.length) {
        alert("No camera found");
        setLoading(false);
        setCameraStarted(false);
        return;
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      const isMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(
          navigator.userAgent
        );

      let selectedCameraId = cameras[0].id;

      if (isMobile) {
        const backCamera =
          cameras.find((cam) =>
            /back|rear|environment/i.test(cam.label)
          ) || cameras[cameras.length - 1];

        selectedCameraId = backCamera.id;
      }

      await scanner.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          facingMode: isMobile
            ? "environment"
            : "user",
        },
        onScanSuccess,
        () => { }
      );

      setLoading(false);
    } catch (error) {
      console.error("Camera start error:", error);
      alert("Camera not available");
      setLoading(false);
      setCameraStarted(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const scanner = new Html5Qrcode("temp-reader");

    try {
      const text = await scanner.scanFile(file, true);
      setScannedData(parseQR(text));
    } catch {
      alert("Invalid QR image");
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <ArrowLeft className="w-5 h-5 " />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Scan QR Code</h1>
            </div>

            {!scannedData ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setScanMode("camera")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer ${scanMode === "camera"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                      }`}
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p>Camera Scan</p>
                  </button>

                  <button
                    onClick={() => setScanMode("upload")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer ${scanMode === "upload"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                      }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p>Upload Image</p>
                  </button>
                </div>

                {scanMode === "camera" ? (
                  <div className="bg-card border-2 border-dashed rounded-2xl p-8 text-center">
                    {!cameraStarted ? (
                      <>
                        <div className="w-48 h-48 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-muted-foreground" />
                        </div>

                        <p className="text-muted-foreground mb-4">
                          Point your camera at a UPI QR code
                        </p>

                        <Button onClick={startCamera} className="w-full cursor-pointer">
                          Start Camera
                        </Button>
                      </>
                    ) : (
                      <div className="w-[340px] h-[250px] mx-auto rounded-2xl overflow-hidden">
                        <div id="reader" className="w-full h-full"></div>
                        {loading && (
                          <p className="mt-3 text-sm">Opening camera...</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card border-2 border-dashed rounded-2xl p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

                    <p className="text-muted-foreground mb-4">
                      Upload a QR code image from your device
                    </p>

                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button asChild className="w-full cursor-pointer hover:shadow-lg transition duration-200">
                        <span>Choose QR Image</span>
                      </Button>
                    </label>
                  </div>
                )}

                {/* Restored */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How it works
                  </h3>

                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Scan a UPI QR code using your camera</li>
                    <li>• Or upload a QR code image from your gallery</li>
                    <li>• Merchant details are extracted automatically</li>
                    <li>• Confirm and proceed to payment</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-success/10 border border-success rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <p className="font-semibold text-success">
                      QR Code Scanned Successfully
                    </p>
                  </div>
                </div>

                <div className="bg-card border rounded-2xl p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Merchant Name
                    </p>
                    <p className="text-lg font-semibold">
                      {scannedData.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      UPI ID
                    </p>
                    <p className="text-lg font-mono">
                      {scannedData.upiId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                    Merchant verified and ready for secure payment
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 ">
                  <Button className="cursor-pointer"
                    variant="outline"
                    onClick={() => setScannedData(null)}
                  >
                    Scan Again
                  </Button>

                  <Link
                    href={`/send-money?receiver=${encodeURIComponent(
                      scannedData.upiId
                    )}&name=${encodeURIComponent(scannedData.name)}`}
                  >
                    <Button className="w-full cursor-pointer">
                      Proceed to Pay
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <div id="temp-reader" className="hidden"></div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
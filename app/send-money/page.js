'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

export default function SendMoneyPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const suggestionRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [toastClosing, setToastClosing] = useState(false);
  const userName = user?.fullName || user?.firstName || "User";

  const [showSuggestions, setShowSuggestions] =
    useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // =========================
  // AUTO FILL FROM QR / CONTACT
  // =========================
  useEffect(() => {
    const receiver =
      searchParams.get('receiver') ||
      searchParams.get('contact');

    if (receiver) {
      setUpiId(receiver);
    }
  }, [searchParams]);

  // =========================
  // OUTSIDE CLICK FOR SUGGESTION
  // =========================
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
  }, []);

  // =========================
  // TOAST
  // =========================
  const showToastMessage = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type,
    });

    setToastClosing(false);

    setTimeout(() => {
      setToastClosing(true);
    }, 2000); // visible time

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success',
      });
      setToastClosing(false);
    }, 2400); // exit complete hone ke baad
  };

  // =========================
  // SOUND
  // =========================
  const playSound = (type) => {
    const file =
      type === 'success'
        ? '/sucess.mp3'
        : '/failed.mp3';

    new Audio(file).play().catch(() => { });
  };

  // =========================
  // SAVE RECENT UPI
  // =========================
  const saveRecentUpi = (upi) => {
    let recent =
      JSON.parse(
        localStorage.getItem('recentUpi')
      ) || [];

    recent = recent.filter((item) => item !== upi);
    recent.unshift(upi);
    recent = recent.slice(0, 5);

    localStorage.setItem(
      'recentUpi',
      JSON.stringify(recent)
    );
  };

  // =========================
  // ADD NOTIFICATION
  // =========================
  const addNotification = (message) => {
    const existing =
      JSON.parse(
        localStorage.getItem('notifications')
      ) || [];

    const updated = [
      {
        id: Date.now(),
        message,
        time: new Date().toLocaleTimeString('en-IN'),
      },
      ...existing,
    ].slice(0, 5);

    localStorage.setItem(
      'notifications',
      JSON.stringify(updated)
    );
  };

  // =========================
  // FETCH SUGGESTIONS
  // =========================
  const updateSuggestions = (value) => {
    const recent =
      JSON.parse(
        localStorage.getItem('recentUpi')
      ) || [];

    const filtered = recent.filter((item) =>
      item
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // =========================
  // RISK CALCULATION
  // =========================
  const calculateRisk = (upi, amt) => {
    if (!upi || !amt) {
      setRiskScore(0);
      return;
    }

    const amountValue = Number(amt);
    let score = 0;

    if (amountValue > 10000) score += 40;
    if (amountValue > 50000) score += 30;

    if (
      upi.toLowerCase().includes('fraud') ||
      upi.toLowerCase().includes('fake')
    ) {
      score += 50;
    }

    setRiskScore(Math.min(score, 100));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    calculateRisk(upiId, value);
  };

  const handleUpiChange = (e) => {
    const value = e.target.value;
    setUpiId(value);
    updateSuggestions(value);
    calculateRisk(value, amount);
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setUpiId('');
    setAmount('');
    setNote('');
    setOtp('');
    setRiskScore(0);
    setIsBlocked(false);
    setShowSuggestions(false);
  };

  // =========================
  // SEND MONEY
  // =========================
  const handleSendMoney = async () => {
    if (!user) return;

    if (isBlocked) return;

    const sender =
      user.primaryEmailAddress.emailAddress.split(
        '@'
      )[0] + '@upi';

    try {
      const res = await fetch(
        'http://localhost:5000/send-money',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender,
            receiver: upiId,
            amount: Number(amount),
            note,
            email: user.primaryEmailAddress.emailAddress,
          }),
        }
      );

      const data = await res.json();

      if (data.status === 'otp_required') {
        setRiskScore(data.riskScore || 0);
        setGeneratedOtp(data.otp);
        setShowOTP(true);
        return;
      }

      if (data.status === 'success') {
        saveRecentUpi(upiId);

        showToastMessage(
          'Money sent successfully!'
        );

        playSound('success');

        resetForm();
      } else if (data.status === 'blocked') {
        showToastMessage(
          data.reason || 'Transaction blocked',
          'error'
        );

        playSound('error');

        resetForm();
      } else {
        showToastMessage(
          data.message ||
          'Transaction failed',
          'error'
        );

        playSound('error');
      }
    } catch {
      showToastMessage(
        'Server error',
        'error'
      );
    }
  };

  // =========================
  // VERIFY OTP
  // =========================
  const handleOTPVerify = async () => {
    if (!user) return;

    const sender =
      user.primaryEmailAddress.emailAddress.split(
        '@'
      )[0] + '@upi';

    try {
      const res = await fetch(
        'http://localhost:5000/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender,
            otp: Number(otp),
          }),
        }
      );

      const data = await res.json();

      if (data.status === 'success') {
        saveRecentUpi(upiId);

        addNotification(
          `₹${amount} sent to ${upiId}`
        );

        showToastMessage(
          'OTP verified! Money sent successfully!'
        );

        playSound('success');

        setShowOTP(false);
        resetForm();
      } else {
        showToastMessage(
          data.message || 'Invalid OTP',
          'error'
        );

        playSound('error');
      }
    } catch {
      showToastMessage(
        'OTP verification failed',
        'error'
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          userName={user?.firstName || 'User'}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
          <div className="w-full max-w-md p-4 sm:p-6">
            {isBlocked && (
              <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">
                    Transaction Blocked
                  </h3>
                  <p className="text-sm text-destructive mt-1">
                    This UPI ID is flagged as
                    fraudulent and has been blocked.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Send Money
                </h1>
                <p className="text-muted-foreground mt-2">
                  Transfer funds via UPI
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                {/* UPI ID */}
                <div
                  className="relative"
                  ref={suggestionRef}
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recipient UPI ID
                  </label>

                  <Input
                    type="text"
                    placeholder="user@upi"
                    value={upiId}
                    onChange={handleUpiChange}
                    onFocus={() =>
                      updateSuggestions(upiId)
                    }
                    disabled={isBlocked}
                    className="rounded-lg"
                  />

                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50">
                      <div className="mx-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden max-h-32 overflow-y-auto">
                        {suggestions.map((item, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setUpiId(item);
                              setShowSuggestions(false);
                              calculateRisk(item, amount);
                            }}
                            className="w-full px-2.5 py-1.5 text-left hover:bg-muted/60 transition-colors border-b border-border/40 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground">
                                {item.charAt(0).toUpperCase()}
                              </div>

                              <p className="text-xs font-medium text-foreground truncate">
                                {item}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    disabled={isBlocked}
                    className="rounded-lg"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Note (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) =>
                      setNote(e.target.value)
                    }
                    disabled={isBlocked}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendMoney}
                disabled={
                  !upiId || !amount || isBlocked
                }
                className="w-full h-12 rounded-lg font-semibold"
              >
                {isBlocked
                  ? 'Transaction Blocked'
                  : 'Send Money'}
              </Button>

              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-foreground">
                  💡 Tips for safe transactions:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    • Always verify the recipient
                    UPI ID
                  </li>
                  <li>
                    • Be cautious with new
                    recipients
                  </li>
                  <li>
                    • Large amounts may require
                    OTP verification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* OTP Modal */}
      <AlertDialog
        open={showOTP}
        onOpenChange={setShowOTP}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Verify OTP
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a high-risk transaction.
              Please verify with OTP.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Recipient: {upiId}
              </p>
              <p className="text-sm font-medium text-foreground mb-2">
                Amount: ₹{amount}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Risk Assessment
                </p>
                <span className="text-sm font-semibold text-yellow-600">
                  {riskScore}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-500 transition-all"
                  style={{ width: `${riskScore}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                High-risk transaction detected. OTP required.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter OTP (6 digits)
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                className="rounded-lg text-center text-2xl tracking-widest"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOTPVerify}
              disabled={otp.length !== 6}
              className="rounded-lg"
            >
              Verify & Send
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-20 right-0 z-50 ${toastClosing ? "toast-out" : "toast-edge-slide"
            } will-change-transform will-change-opacity`}
        >
          <div
            className={`w-80 border-l border-t border-b shadow-2xl px-4 py-3 ${toast.type === 'error'
              ? 'bg-red-600/95 border-red-500 text-white'
              : 'bg-green-600/95 border-green-500 text-white'
              }`}
          >
            <p className="text-sm font-semibold">
              {toast.message}
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
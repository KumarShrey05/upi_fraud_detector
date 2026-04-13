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
  const [receiverName, setReceiverName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [toastClosing, setToastClosing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const receiver =
      searchParams.get('receiver') ||
      searchParams.get('contact');

    const name =
      searchParams.get('name');

    if (receiver) setUpiId(receiver);
    if (name) setReceiverName(name);
  }, [searchParams]);

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

  const syncReceiverFields = (value, type) => {
    if (!value) {
      setUpiId('');
      setReceiverName('');
      return;
    }

    if (type === 'upi') {
      setReceiverName(
        value.split('@')[0]
      );
    } else {
      const clean =
        value.toLowerCase().replace(/\s+/g, '');
      setUpiId(`${clean}@upi`);
    }
  };

  const showToastMessage = (
    message,
    type = 'success'
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setToastClosing(false);

    setTimeout(
      () => setToastClosing(true),
      2000
    );

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success',
      });
      setToastClosing(false);
    }, 2400);
  };

  const playSound = (type) => {
    const file =
      type === 'success'
        ? '/sucess.mp3'
        : '/failed.mp3';

    new Audio(file)
      .play()
      .catch(() => {});
  };

  const saveRecentUpi = (upi) => {
    let recent =
      JSON.parse(
        localStorage.getItem(
          'recentUpi'
        )
      ) || [];

    recent = recent.filter(
      (item) => item !== upi
    );

    recent.unshift(upi);

    localStorage.setItem(
      'recentUpi',
      JSON.stringify(
        recent.slice(0, 5)
      )
    );
  };

  const addNotification = (
    message
  ) => {
    const existing =
      JSON.parse(
        localStorage.getItem(
          'notifications'
        )
      ) || [];

    const updated = [
      {
        id: Date.now(),
        message,
        time: new Date().toLocaleTimeString(
          'en-IN'
        ),
      },
      ...existing,
    ].slice(0, 5);

    localStorage.setItem(
      'notifications',
      JSON.stringify(updated)
    );
  };

  const updateSuggestions = (
    value
  ) => {
    const recent =
      JSON.parse(
        localStorage.getItem(
          'recentUpi'
        )
      ) || [];

    const filtered =
      recent.filter((item) =>
        item
          .toLowerCase()
          .includes(
            value.toLowerCase()
          )
      );

    setSuggestions(filtered);
    setShowSuggestions(
      filtered.length > 0
    );
  };

  const calculateRisk = (
    upi,
    amt
  ) => {
    if (!upi || !amt) {
      setRiskScore(0);
      return;
    }

    let score = 0;
    const value = Number(amt);

    if (value > 10000) score += 40;
    if (value > 50000) score += 30;

    if (
      upi
        .toLowerCase()
        .includes('fraud') ||
      upi
        .toLowerCase()
        .includes('fake')
    ) {
      score += 50;
    }

    setRiskScore(
      Math.min(score, 100)
    );
  };

  const handleAmountChange = (
    e
  ) => {
    const value = e.target.value;
    setAmount(value);
    calculateRisk(upiId, value);
  };

  const handleUpiChange = (
    e
  ) => {
    const value = e.target.value;
    setUpiId(value);
    syncReceiverFields(
      value,
      'upi'
    );
    updateSuggestions(value);
    calculateRisk(
      value,
      amount
    );
  };

  const handleNameChange = (
    e
  ) => {
    const value = e.target.value;
    setReceiverName(value);
    syncReceiverFields(
      value,
      'name'
    );
  };

  const resetForm = () => {
    setUpiId('');
    setReceiverName('');
    setAmount('');
    setNote('');
    setOtp('');
    setRiskScore(0);
    setIsBlocked(false);
    setShowSuggestions(false);
  };

  const handleSendMoney =
    async () => {
      if (!user || isBlocked)
        return;

      const sender =
        user.primaryEmailAddress.emailAddress.split(
          '@'
        )[0] + '@upi';

      try {
        const res =
          await fetch(
            'http://localhost:5000/send-money',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                sender,
                receiver: upiId,
                amount:
                  Number(amount),
                note,
                email:
                  user
                    .primaryEmailAddress
                    .emailAddress,
              }),
            }
          );

        const data =
          await res.json();

        if (
          data.status ===
          'otp_required'
        ) {
          setRiskScore(
            data.riskScore ||
              0
          );
          setGeneratedOtp(
            data.otp
          );
          setShowOTP(true);
          return;
        }

        if (
          data.status ===
          'success'
        ) {
          saveRecentUpi(upiId);

          showToastMessage(
            'Money sent successfully!'
          );

          playSound(
            'success'
          );

          resetForm();
        } else {
          showToastMessage(
            data.reason ||
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          userName={
            user?.firstName ||
            'User'
          }
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
          <div className="w-full max-w-md p-4 sm:p-6">
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

                {/* Receiver Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Receiver Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter receiver name"
                    value={receiverName}
                    onChange={
                      handleNameChange
                    }
                    className="rounded-lg"
                  />
                </div>

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
                    onChange={
                      handleUpiChange
                    }
                    className="rounded-lg"
                  />
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
                    onChange={
                      handleAmountChange
                    }
                    className="rounded-lg"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Note
                  </label>
                  <Input
                    type="text"
                    value={note}
                    onChange={(e) =>
                      setNote(
                        e.target.value
                      )
                    }
                    className="rounded-lg"
                  />
                </div>
              </div>

              <Button
                onClick={
                  handleSendMoney
                }
                className="w-full h-12 rounded-lg font-semibold"
              >
                Send Money
              </Button>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
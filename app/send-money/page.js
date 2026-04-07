'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { RiskBar } from '@/components/cards/Risk-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

export default function SendMoneyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const calculateRisk = (upi, amt) => {
    if (!upi || !amt) return 0;

    let risk = Math.random() * 40; // Base risk

    // Check if UPI is in fraud list
    if (
      upi.toLowerCase().includes('fraud') ||
      upi.toLowerCase().includes('fake')
    ) {
      risk += 50;
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }

    // Large amount increases risk
    if (parseInt(amt) > 10000) {
      risk += 20;
    }

    return Math.min(risk, 100);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    if (upiId) {
      setRiskScore(calculateRisk(upiId, value));
    }
  };

  const handleUpiChange = (e) => {
    const value = e.target.value;
    setUpiId(value);
    if (amount) {
      setRiskScore(calculateRisk(value, amount));
    }
  };

  const handleSendMoney = () => {
    if (isBlocked) {
      return;
    }
    if (riskScore > 60) {
      setShowOTP(true);
    } else {
      alert('Money sent successfully!');
      setUpiId('');
      setAmount('');
      setRiskScore(0);
    }
  };

  const handleOTPVerify = () => {
    if (otp.length === 6) {
      alert('OTP verified! Money sent successfully!');
      setShowOTP(false);
      setOtp('');
      setUpiId('');
      setAmount('');
      setRiskScore(0);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Arjun"
        />

        {/* Content */}
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
                    This UPI ID is flagged as fraudulent and has been blocked.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Send Money</h1>
                <p className="text-muted-foreground mt-2">
                  Transfer funds via UPI
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                {/* UPI ID */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recipient UPI ID
                  </label>
                  <Input
                    type="text"
                    placeholder="user@bank"
                    value={upiId}
                    onChange={handleUpiChange}
                    disabled={isBlocked}
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
                    disabled={isBlocked}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Risk Assessment */}
              {(upiId || amount) && (
                <RiskBar
                  score={Math.round(riskScore)}
                  reason={
                    riskScore > 60
                      ? 'Large amount or new recipient'
                      : undefined
                  }
                />
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSendMoney}
                disabled={!upiId || !amount || isBlocked}
                className="w-full h-12 rounded-lg font-semibold"
              >
                {isBlocked ? 'Transaction Blocked' : 'Send Money'}
              </Button>

              {/* Additional Info */}
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-foreground">
                  💡 Tips for safe transactions:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Always verify the recipient UPI ID</li>
                  <li>• Be cautious with new recipients</li>
                  <li>• Large amounts may require OTP verification</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* OTP Modal */}
      <AlertDialog open={showOTP} onOpenChange={setShowOTP}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify OTP</AlertDialogTitle>
            <AlertDialogDescription>
              This is a high-risk transaction. Please verify with OTP.
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter OTP (6 digits)
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="rounded-lg text-center text-2xl tracking-widest"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
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

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

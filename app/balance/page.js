'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { ArrowLeft, RefreshCw, ShieldCheck, Lock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';

export default function BalancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captcha, setCaptcha] = useState('');

  const { user } = useUser();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
    setShowBalance(false);
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  useEffect(() => {
    let socket;

    const fetchUser = async () => {
      try {
        if (!user?.primaryEmailAddress?.emailAddress) {
          setBalance(0);
          setLoading(false);
          return;
        }

        const email = user.primaryEmailAddress.emailAddress;

        const res = await fetch(
          `http://localhost:5000/user/email/${encodeURIComponent(email)}`
        );

        const data = await res.json();

        setBalance(Number(data.balance) || 0);

        if (data.upiId) {
          socket = io('http://localhost:5000');
          socket.emit('join', data.upiId);

          socket.on('balanceUpdated', async () => {
            const latest = await fetch(
              `http://localhost:5000/user/${data.upiId}`
            );

            const latestData = await latest.json();
            setBalance(Number(latestData.balance) || 0);
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  const verifyCaptcha = () => {
    if (captchaInput.toUpperCase() === captcha) {
      setShowBalance(true);
      setCaptchaError('');

      setTimeout(() => {
        setShowBalance(false);
        refreshCaptcha();
      }, 30000);
    } else {
      setCaptchaError('Invalid captcha');
      refreshCaptcha();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.firstName || 'User'}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="w-full max-w-3xl lg:max-w-[820px] xl:max-w-[820px] mx-auto px-4 sm:px-5 lg:px-4 py-4 sm:py-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:opacity-80">
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>

            {/* HERO CARD */}
            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-5 sm:px-6 py-6 sm:py-7 shadow-xl min-h-[170px] sm:min-h-[190px] w-full">
              <div className="absolute top-6 right-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 flex flex-col justify-center h-full">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-white/60">
                  Secure Balance Vault
                </p>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3">
                  Your Wallet Balance
                </h1>

                <p className="text-white/70 mt-2 text-sm sm:text-base max-w-2xl">
                  Protected by live fraud detection and session verification
                </p>

                <div className="mt-5">
                  <p className="text-sm text-white/60">
                    Available Balance
                  </p>

                  <p className="text-3xl sm:text-4xl font-bold mt-2 tracking-wide">
                    {showBalance && !loading
                      ? `₹${balance.toLocaleString('en-IN')}`
                      : '₹ ••••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* CAPTCHA CARD */}
            <div className="rounded-[26px] border border-border bg-card text-card-foreground shadow-lg p-5 sm:p-6 w-full">  <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">
                Security Verification
              </h2>
            </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold tracking-[0.45em] text-slate-800 select-none">
                    {captcha}
                  </span>

                  <button
                    onClick={refreshCaptcha}
                    className="w-11 h-11 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 relative">
                <input
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type the code above"
                  className="w-full rounded-3xl border border-border bg-background text-foreground placeholder:text-muted-foreground p-4 text-base outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {captchaError && (
                <p className="text-sm text-red-500 mt-2">
                  {captchaError}
                </p>
              )}

              <button
                onClick={verifyCaptcha}
                className="w-full mt-4 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 font-medium shadow-md hover:shadow-lg transition cursor-pointer"
              >
                Verify & Reveal Balance
              </button>
            </div>

            {/* INFO GRID */}
            <div className="grid md:grid-cols-2 gap-5">
              <InfoCard
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Protection Layer"
                items={[
                  'Fraud Detection Active',
                  'OTP Security Enabled',
                  'Live Balance Sync',
                  'Encrypted Session',
                ]}
              />

              <InfoCard
                icon={<Lock className="w-5 h-5" />}
                title="Smart Tips"
                items={[
                  'Never share OTP',
                  'Verify receiver UPI',
                  'High amount protection',
                  'Auto hide after 30 sec',
                ]}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl bg-muted p-3 text-sm">
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}
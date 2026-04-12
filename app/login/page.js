'use client';

import { useEffect } from 'react';
import {
  SignIn,
  useUser,
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Zap,
} from 'lucide-react';

export default function Login() {
  const {
    isLoaded,
    isSignedIn,
    user,
  } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn
    ) {
      router.replace('/dashboard');
    }
  }, [
    isLoaded,
    isSignedIn,
    router,
  ]);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>
          Already logged in as{' '}
          {user?.fullName}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-border bg-card">

        {/* Left */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <h1 className="text-4xl font-bold">
            Welcome to UPay
          </h1>

          <p className="mt-4 text-white/80 leading-7">
            Secure UPI payments with intelligent fraud detection and real-time risk insights.
          </p>

          <div className="mt-8 space-y-4">
            <FeatureRow
              icon={
                <ShieldCheck className="w-5 h-5" />
              }
              text="AI-Powered Fraud Detection"
            />

            <FeatureRow
              icon={
                <Lock className="w-5 h-5" />
              }
              text="Secure OTP Verification"
            />

            <FeatureRow
              icon={
                <Zap className="w-5 h-5" />
              }
              text="Instant Transaction Monitoring"
            />
          </div>
        </div>

        {/* Right */}
        <div className="p-8 flex items-center justify-center">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                card: 'shadow-none border-none',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-white/15 p-2">
        {icon}
      </div>
      <p>{text}</p>
    </div>
  );
}
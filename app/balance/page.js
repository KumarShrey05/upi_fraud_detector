'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { BalanceCard} from '@/components/cards/Balance-card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
export default function BalancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useUser();

  // ✅ FETCH USER FROM BACKEND
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.primaryEmailAddress?.emailAddress) return;

        const res = await fetch(
          `http://localhost:5000/user/email/${user.primaryEmailAddress.emailAddress}`
        );

        const data = await res.json();

        setBalance(data.balance);
        setUpiId(data.upiId);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.firstName || 'User'}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">

            {/* Back */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-primary font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold">Your Balance</h1>
              <p className="text-muted-foreground">
                View your account balance and details
              </p>
            </div>

            {/* Balance Card */}
            <BalanceCard
              balance={balance}
              upiId={upiId}
              showBalance={!loading}
            />

            {/* Account Details */}
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold">Account Details</h2>

              <div className="flex justify-between border-b pb-3">
                <span>Current Balance</span>
                <span className="font-bold">
                  ₹{loading ? '...' : balance.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span>Account Status</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span>Last Updated</span>
                <span>Just now</span>
              </div>

              <div className="flex justify-between">
                <span>Account Type</span>
                <span>Savings</span>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold">Security Status</h2>

              <p>🟢 2-Factor Authentication Enabled</p>
              <p>🟢 Fraud Detection Active</p>
              <p>🟢 Encrypted Connection</p>
            </div>

          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
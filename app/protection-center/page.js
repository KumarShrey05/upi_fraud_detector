'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function FraudListPage() {
  const { user } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!user?.primaryEmailAddress?.emailAddress) return;

        const email =
          user.primaryEmailAddress.emailAddress;

        const userRes = await fetch(
          `http://localhost:5000/user/email/${email}`
        );

        const userData = await userRes.json();

        if (!userData?.upiId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:5000/fraud-insights/${userData.upiId}`
        );

        const data = await res.json();

        setInsights(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  const getThreatColor = () => {
    if (!insights?.threatLevel) return 'bg-gray-500';

    if (insights.threatLevel === 'HIGH')
      return 'bg-red-500';

    if (insights.threatLevel === 'MEDIUM')
      return 'bg-yellow-500';

    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading fraud insights...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

            {/* HERO */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/20 backdrop-blur-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 shadow-2xl min-h-[320px]">
              <div className="absolute top-10 right-10 w-44 h-44 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-sm tracking-[0.3em] uppercase text-white/60">
                    Fraud Protection Center
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <h1 className="text-4xl font-bold">
                      Threat Level
                    </h1>

                    <span className={`px-3 py-1 rounded-full text-sm ${getThreatColor()}`}>
                      {insights?.threatLevel}
                    </span>
                  </div>

                  <p className="mt-4 text-white/70 leading-7">
                    Total monitored transactions: {insights?.totalCount || 0}<br />
                    High risk transactions: {insights?.highRiskCount || 0}<br />
                    Risk ratio: {insights?.riskRatio || 0}%<br />
                    Avg suspicious amount: ₹{insights?.avgAmount || 0}
                  </p>

                  <div className="flex gap-4 mt-6 flex-wrap">
                    <GlassStat
                      icon={<ShieldAlert />}
                      label="Blocked"
                      value={insights?.blockedCount || 0}
                    />
                    <GlassStat
                      icon={<ShieldCheck />}
                      label="Safe"
                      value={insights?.safeCount || 0}
                    />
                    <GlassStat
                      icon={<Sparkles />}
                      label="OTP"
                      value={insights?.otpCount || 0}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-52 h-52 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl animate-pulse">
                    <div className="absolute w-40 h-40 rounded-full border border-white/30" />
                    <div className="absolute w-28 h-28 rounded-full border border-white/40" />
                    <Shield className="w-14 h-14" />
                  </div>
                </div>
              </div>
            </div>

            {/* ANALYTICS */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-3xl border p-6 bg-card shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">
                    Live Fraud Analytics
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <StoryLine text={`${insights?.blockedCount || 0} blocked attempts`} />
                  <StoryLine text={`${insights?.otpCount || 0} OTP verifications`} />
                  <StoryLine text={`${insights?.highRiskCount || 0} high-risk transactions`} />
                  <StoryLine text={`₹${insights?.totalAmount || 0} total monitored amount`} />
                </div>
              </div>

              <div className="rounded-3xl border p-6 bg-card shadow-sm">
                <h2 className="text-xl font-semibold mb-5">
                  Protection Score
                </h2>

                <p className="text-4xl font-bold mt-2">
                  {insights?.protectionScore || 0}%
                </p>

                <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-primary transition-all duration-700"
                    style={{
                      width: `${insights?.protectionScore || 0}%`
                    }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <MiniMetric
                    label="Total Amount"
                    value={`₹${insights?.totalAmount || 0}`}
                  />
                  <MiniMetric
                    label="Avg Amount"
                    value={`₹${insights?.avgAmount || 0}`}
                  />
                </div>
              </div>
            </div>

            {/* LATEST */}
            <div className="rounded-3xl border p-6 bg-gradient-to-r from-background to-muted/40 shadow-sm">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 mt-1" />

                <div>
                  <h3 className="font-semibold text-lg">
                    Latest Fraud Insight
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2 leading-7">
                    {insights?.latestTransaction
                      ? `₹${insights.latestTransaction.amount} from ${insights.latestTransaction.sender} to ${insights.latestTransaction.receiver}`
                      : 'No suspicious transactions found'}
                  </p>

                  {insights?.latestTransaction?.time && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(
                        insights.latestTransaction.time
                      ).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function GlassStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 border border-white/10 min-w-[90px]">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

function StoryLine({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <p>{text}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
      <p className="text-xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}
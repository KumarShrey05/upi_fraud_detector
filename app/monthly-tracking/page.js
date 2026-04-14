'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b'];

export default function MonthlyTrackingPage() {
  const { user } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [duration, setDuration] = useState('3');

  const [currentUpi, setCurrentUpi] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;

        if (!email) {
          setTransactions([]);
          return;
        }

        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/email/${encodeURIComponent(email)}`
        );

        const profileData = await profileRes.json();
        const upiId = profileData?.upiId;

        if (!upiId) {
          setTransactions([]);
          return;
        }

        setCurrentUpi(upiId);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/${upiId}`
        );
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTransactions();
  }, [user, currentUpi]);

  const filteredTransactions = useMemo(() => {
    const monthsBack = Number(duration);
    const cutoff = new Date();

    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setMonth(cutoff.getMonth() - monthsBack + 1);

    return transactions.filter(
      (txn) => new Date(txn.time) >= cutoff
    );
  }, [transactions, duration]);

  const monthlyData = useMemo(() => {
    const monthsBack = Number(duration);
    const result = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      const monthKey = date.toLocaleString('en-IN', {
        month: 'short',
      });

      result.push({
        month: monthKey,
        sent: 0,
        received: 0,
      });
    }

    filteredTransactions.forEach((txn) => {
      const txnDate = new Date(txn.time);
      const txnMonth = txnDate.toLocaleString('en-IN', {
        month: 'short',
      });

      const monthEntry = result.find(
        (item) => item.month === txnMonth
      );

      if (!monthEntry) return;

      if (txn.sender === currentUpi) {
        monthEntry.sent += Number(txn.amount);
      }

      if (txn.receiver === currentUpi) {
        monthEntry.received += Number(txn.amount);
      }
    });

    return result;
  }, [filteredTransactions, currentUpi, duration]);

  const totalSent = filteredTransactions
    .filter((txn) => txn.sender === currentUpi)
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const totalReceived = filteredTransactions
    .filter((txn) => txn.receiver === currentUpi)
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const blockedCount = filteredTransactions.filter(
    (txn) => txn.status === 'blocked'
  ).length;

  const otpCount = filteredTransactions.filter(
    (txn) =>
      txn.reason?.toLowerCase().includes('otp')
  ).length;

  const avgTxn =
    filteredTransactions.length > 0
      ? Math.round(
        filteredTransactions.reduce(
          (sum, txn) =>
            sum + Number(txn.amount),
          0
        ) / filteredTransactions.length
      )
      : 0;

  const highestSent =
    filteredTransactions
      .filter(
        (txn) => txn.sender === currentUpi
      )
      .reduce(
        (max, txn) =>
          Math.max(max, Number(txn.amount)),
        0
      ) || 0;

  const pieData = [
    { name: 'Sent', value: totalSent },
    { name: 'Received', value: totalReceived },
    { name: 'Blocked', value: blockedCount },
    { name: 'OTP', value: otpCount },
  ];

  const maxMetricValue = Math.max(
    avgTxn,
    highestSent,
    blockedCount,
    otpCount,
    1
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Monthly Tracking
                </h1>
                <p className="text-muted-foreground">
                  Smart analytics dashboard
                </p>
              </div>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                className="border rounded-xl px-4 py-2 bg-card"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-card border rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Bar
                      dataKey="sent"
                      fill="#6366f1"
                      barSize={40}
                      radius={[8, 8, 0, 0]}
                      animationDuration={400}
                    />

                    <Bar
                      dataKey="received"
                      fill="#22c55e"
                      barSize={40}
                      radius={[8, 8, 0, 0]}
                      animationDuration={450}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={90}
                      innerRadius={45}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Avg Txn"
                value={`₹${avgTxn}`}
                progress={Math.max(
                  Math.min((avgTxn / 5000) * 100, 100),
                  20
                )}
              />

              <MetricCard
                label="Highest Sent"
                value={`₹${highestSent}`}
                progress={Math.max(
                  Math.min((highestSent / 15000) * 100, 100),
                  25
                )}
              />

              <MetricCard
                label="Blocked"
                value={blockedCount}
                progress={Math.max(
                  Math.min((blockedCount / 30) * 100, 100),
                  15
                )}
              />

              <MetricCard
                label="OTP Verified"
                value={otpCount}
                progress={Math.max(
                  Math.min((otpCount / 30) * 100, 100),
                  15
                )}
              />
            </div>

            {/* Unique bottom tiles */}
            <div className="grid md:grid-cols-3 gap-4">
              <InfoTile
                title="Cash Flow"
                text={`₹${totalReceived - totalSent} net balance in selected period`}
              />
              <InfoTile
                title="Security"
                text={`${blockedCount === 0 ? 'No fraud alerts' : blockedCount + ' alerts detected'}`}
              />
              <InfoTile
                title="Activity"
                text={`${filteredTransactions.length} total transactions`}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function MetricCard({ label, value, progress = 0 }) {
  return (
    <div className="bg-card border rounded-3xl p-6 min-h-[150px] flex flex-col justify-between shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="text-2xl font-bold mt-4">
        {value}
      </p>

      <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function InfoTile({ title, text }) {
  return (
    <div className="rounded-3xl border p-6 bg-card shadow-sm min-h-[130px]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
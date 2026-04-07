'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { InsightCard } from '@/components/cards/Insight-card';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {entry.name === 'sent' ? 'Sent' : 'Received'}: ₹{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    securityScore: 98,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const upiId =
      user.primaryEmailAddress.emailAddress.split('@')[0] +
      '@upi';

    const socket = io('http://localhost:5000');
    socket.emit('join', upiId);

    const fetchDashboardData = async () => {
      try {
        const userRes = await fetch(
          `http://localhost:5000/user/${upiId}`
        );
        const userData = await userRes.json();

        const txnRes = await fetch(
          `http://localhost:5000/transactions/${upiId}`
        );
        const txnData = await txnRes.json();

        setBalance(Number(userData.balance) || 0);
        setTransactions(txnData || []);

        const sent = txnData
          .filter(
            (txn) =>
              txn.sender === upiId &&
              txn.status === 'success'
          )
          .reduce(
            (sum, txn) =>
              sum + Number(txn.amount),
            0
          );

        const received = txnData
          .filter(
            (txn) =>
              txn.receiver === upiId &&
              txn.status === 'success'
          )
          .reduce(
            (sum, txn) =>
              sum + Number(txn.amount),
            0
          );

        setStats({
          totalSent: sent,
          totalReceived: received,
          securityScore: 98,
        });

        const graphTransactions = txnData
          .filter((txn) => txn.status === 'success')
          .slice(0, 7)
          .reverse()
          .map((txn, index) => ({
            date:
              new Date(txn.time).toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'short',
                }
              ) + `-${index + 1}`,
            sent:
              txn.sender === upiId
                ? Number(txn.amount)
                : 0,
            received:
              txn.receiver === upiId
                ? Number(txn.amount)
                : 0,
          }));

        setChartData(graphTransactions);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboardData();
    socket.on('balanceUpdated', fetchDashboardData);

    return () => socket.disconnect();
  }, [isLoaded, user]);

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

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Overview of your financial activity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm font-medium">
                  Account Balance
                </p>
                <p className="text-3xl font-bold mt-2">
                  ₹{balance.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Sent
                </p>
                <p className="text-3xl font-bold mt-2">
                  ₹{stats.totalSent.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Received
                </p>
                <p className="text-3xl font-bold mt-2">
                  ₹{stats.totalReceived.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm font-medium">
                  Security Score
                </p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {stats.securityScore}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Recent Transaction Trend
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      value.split('-')[0]
                    }
                  />
                  <YAxis />
                  
                  {/* ✅ Custom Tooltip */}
                  <Tooltip content={<CustomTooltip />} />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    isAnimationActive={true}
      animationDuration={3000}
      animationEasing="ease-in-out"
                  />

                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                          isAnimationActive={true}
      animationDuration={3000}
      animationEasing="ease-in-out"
      // animationBegin={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InsightCard
                type="success"
                title="Account Verified"
                description="Your account has passed all security checks"
                metric="✅ 100% Verified"
              />

              <InsightCard
                type="info"
                title="Recent Activity"
                description="No suspicious activity detected in the last 30 days"
                metric={`📊 ${transactions.length} Transactions`}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
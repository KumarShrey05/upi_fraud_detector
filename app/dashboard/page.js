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

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    active &&
    payload &&
    payload.length
  ) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
        <p className="text-xs text-gray-500 mb-1">
          {label}
        </p>

        {payload.map(
          (entry, index) => (
            <p
              key={index}
              className="text-sm font-medium"
              style={{
                color: entry.color,
              }}
            >
              {entry.name === 'sent'
                ? 'Sent'
                : 'Received'}
              : ₹{entry.value}
            </p>
          )
        )}
      </div>
    );
  }

  return null;
};

export default function DashboardPage() {
  const { user, isLoaded } =
    useUser();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [balance, setBalance] =
    useState(0);

  const [transactions, setTransactions] =
    useState([]);

  const [stats, setStats] =
    useState({
      totalSent: 0,
      totalReceived: 0,
      protectionScore: 0,
    });

  const [chartData, setChartData] =
    useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    let socket;

    const fetchDashboardData =
      async () => {
        try {
          if (!user) {
            setBalance(0);
            setTransactions([]);
            setChartData([]);

            setStats({
              totalSent: 0,
              totalReceived: 0,
              protectionScore: 0,
            });

            return;
          }

          const email =
            user
              .primaryEmailAddress
              ?.emailAddress;

          const profileRes =
            await fetch(
              `http://localhost:5000/user/email/${encodeURIComponent(
                email
              )}`
            );

          const profileData =
            await profileRes.json();

          const upiId =
            profileData?.upiId;

          if (!upiId) {
            setBalance(0);
            setTransactions([]);
            setChartData([]);

            setStats({
              totalSent: 0,
              totalReceived: 0,
              protectionScore: 0,
            });

            return;
          }

          socket = io(
            'http://localhost:5000'
          );

          socket.emit(
            'join',
            upiId
          );

          const userRes =
            await fetch(
              `http://localhost:5000/user/${upiId}`
            );

          const userData =
            await userRes.json();

          const txnRes =
            await fetch(
              `http://localhost:5000/transactions/${upiId}`
            );

          const txnData =
            await txnRes.json();

          const insightRes =
            await fetch(
              `http://localhost:5000/fraud-insights/${upiId}`
            );

          const insightData =
            await insightRes.json();

          setBalance(
            Number(
              userData.balance
            ) || 0
          );

          setTransactions(
            txnData || []
          );

          const successfulTxns =
            txnData.filter(
              (txn) =>
                txn.status ===
                'success'
            );

          const sent =
            successfulTxns
              .filter(
                (txn) =>
                  txn.sender ===
                  upiId
              )
              .reduce(
                (
                  sum,
                  txn
                ) =>
                  sum +
                  Number(
                    txn.amount
                  ),
                0
              );

          const received =
            successfulTxns
              .filter(
                (txn) =>
                  txn.receiver ===
                  upiId
              )
              .reduce(
                (
                  sum,
                  txn
                ) =>
                  sum +
                  Number(
                    txn.amount
                  ),
                0
              );

          setStats({
            totalSent: sent,
            totalReceived:
              received,
            protectionScore:
              insightData?.protectionScore ||
              0,
          });

          const graphTransactions =
            successfulTxns
              .slice(0, 7)
              .reverse()
              .map(
                (
                  txn,
                  index
                ) => ({
                  date:
                    new Date(
                      txn.time
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month:
                          'short',
                      }
                    ) +
                    `-${index +
                    1
                    }`,
                  sent:
                    txn.sender ===
                      upiId
                      ? Number(
                        txn.amount
                      )
                      : 0,
                  received:
                    txn.receiver ===
                      upiId
                      ? Number(
                        txn.amount
                      )
                      : 0,
                })
              );

          setChartData(
            graphTransactions
          );

          socket.on(
            'balanceUpdated',
            fetchDashboardData
          );
        } catch (error) {
          console.log(error);
        }
      };

    fetchDashboardData();

    return () => {
      if (socket)
        socket.disconnect();
    };
  }, [isLoaded, user]);

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

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>

              <p className="text-muted-foreground mt-1">
                Overview of your
                financial
                activity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Account Balance"
                value={`₹${balance.toLocaleString(
                  'en-IN'
                )}`}
              />

              <MetricCard
                title="Total Sent"
                value={`₹${stats.totalSent.toLocaleString(
                  'en-IN'
                )}`}
              />

              <MetricCard
                title="Total Received"
                value={`₹${stats.totalReceived.toLocaleString(
                  'en-IN'
                )}`}
              />

              <MetricCard
                title="Protection Score"
                value={`${stats.protectionScore}%`}
                green
              />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Recent
                Transaction
                Trend
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={chartData}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(
                      value
                    ) =>
                      value.split(
                        '-'
                      )[0]
                    }
                  />

                  <YAxis />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#6366f1"
                    strokeWidth={
                      2.5
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="#22c55e"
                    strokeWidth={
                      2.5
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InsightCard
                type="success"
                title="Account Verified"
                description="Your account has passed all security checks"
                metric={`✅ ${user
                    ? '100'
                    : '0'
                  }% Verified`}
              />

              <InsightCard
                type="info"
                title="Recent Activity"
                description="Transaction activity in the last 30 days"
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

function MetricCard({
  title,
  value,
  green,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <p className="text-muted-foreground text-sm font-medium">
        {title}
      </p>

      <p
        className={`text-3xl font-bold mt-2 ${green
            ? 'text-green-500'
            : ''
          }`}
      >
        {value}
      </p>
    </div>
  );
}
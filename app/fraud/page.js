'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', sent: 8500, received: 3200 },
  { month: 'Feb', sent: 12000, received: 4500 },
  { month: 'Mar', sent: 10200, received: 5100 },
  { month: 'Apr', sent: 15000, received: 6800 },
];

const categoryData = [
  { name: 'Groceries', value: 8500 },
  { name: 'Utilities', value: 5200 },
  { name: 'Entertainment', value: 3800 },
  { name: 'Food & Dining', value: 7300 },
  { name: 'Others', value: 4200 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function MonthlyTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Apr');

  const totalSent = monthlyData.reduce((sum, d) => sum + d.sent, 0);
  const totalReceived = monthlyData.reduce((sum, d) => sum + d.received, 0);
  const currentMonthData = monthlyData.find(d => d.month === selectedMonth);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Monthly Tracking"
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Monthly Tracking</h1>
              <p className="text-muted-foreground">Analyze your spending and income patterns</p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold text-primary mt-2">₹{totalSent.toLocaleString('en-IN')}</p>
                  </div>
                  <ArrowUpRight className="w-10 h-10 text-primary/20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold text-success mt-2">₹{totalReceived.toLocaleString('en-IN')}</p>
                  </div>
                  <ArrowDownLeft className="w-10 h-10 text-success/20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Flow</p>
                    <p className="text-2xl font-bold text-secondary mt-2">₹{(totalSent - totalReceived).toLocaleString('en-IN')}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-secondary/20" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Monthly Transactions</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Bar dataKey="sent" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="received" fill="var(--success)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Spending by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Month Selector */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Month Details</h2>
              </div>

              {/* Month Buttons */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {monthlyData.map(({ month }) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedMonth === month
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-border'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>

              {/* Month Stats */}
              {currentMonthData && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-input rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Amount Sent</p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      ₹{currentMonthData.sent.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-input rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Amount Received</p>
                    <p className="text-2xl font-bold text-success mt-2">
                      ₹{currentMonthData.received.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-input rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Transaction Count</p>
                    <p className="text-2xl font-bold text-secondary mt-2">
                      {Math.floor((currentMonthData.sent + currentMonthData.received) / 1000)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Top Spending Categories</h2>
              <div className="space-y-3">
                {categoryData.map((category, index) => {
                  const percentage = (category.value / categoryData.reduce((sum, c) => sum + c.value, 0)) * 100;
                  return (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <p className="font-medium text-foreground">{category.name}</p>
                        </div>
                        <p className="font-semibold text-foreground">₹{category.value.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

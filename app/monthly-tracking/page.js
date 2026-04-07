'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Monthly Tracking"
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Monthly Tracking</h1>
              <p className="text-muted-foreground">
                Analyze your spending and income
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-2xl p-4">
                <p>Total Sent</p>
                <p className="text-xl font-bold">₹{totalSent}</p>
              </div>

              <div className="bg-card border rounded-2xl p-4">
                <p>Total Received</p>
                <p className="text-xl font-bold">₹{totalReceived}</p>
              </div>

              <div className="bg-card border rounded-2xl p-4">
                <p>Net Flow</p>
                <p className="text-xl font-bold">
                  ₹{totalSent - totalReceived}
                </p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-bold mb-4">Monthly Data</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#6366f1" />
                  <Bar dataKey="received" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-bold mb-4">Categories</h2>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
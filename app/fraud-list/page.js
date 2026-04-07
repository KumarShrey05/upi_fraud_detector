'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { AlertTriangle, XCircle, CheckCircle2, Filter } from 'lucide-react';

export default function FraudListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [frauds, setFrauds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // ✅ FETCH REAL DATA
  useEffect(() => {
    fetch('http://localhost:5000/fraud-transactions')
      .then((res) => res.json())
      .then((data) => setFrauds(data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ FILTER LOGIC
  const filteredTransactions =
    filterStatus === 'all'
      ? frauds
      : frauds.filter((t) => t.status === filterStatus);

  // ✅ ICONS
  const getStatusIcon = (status) => {
    if (status === 'blocked')
      return <XCircle className="w-5 h-5 text-destructive" />;
    if (status === 'otp_required')
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    if (status === 'success')
      return <CheckCircle2 className="w-5 h-5 text-success" />;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Admin"
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Fraud & Security</h1>
              <p className="text-muted-foreground">
                Monitor blocked transactions
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-2xl p-4">
                <p className="text-sm">Blocked</p>
                <p className="text-2xl font-bold text-red-500">
                  {frauds.filter((t) => t.status === 'blocked').length}
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-4">
                <p className="text-sm">OTP Required</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {frauds.filter((t) => t.status === 'otp_required').length}
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-4">
                <p className="text-sm">Safe</p>
                <p className="text-2xl font-bold text-green-500">
                  {frauds.filter((t) => t.status === 'success').length}
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-card border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <p className="font-medium">Filter</p>
              </div>

              <div className="flex gap-2">
                {['all', 'blocked', 'otp_required', 'success'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded ${
                      filterStatus === status
                        ? 'bg-primary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn, i) => (
                  <div
                    key={i}
                    className="bg-card border rounded-xl p-4 flex justify-between"
                  >
                    <div className="flex gap-3">
                      {getStatusIcon(txn.status)}

                      <div>
                        <p className="font-semibold">
                          {txn.sender} → {txn.receiver}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.time).toLocaleString()}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {txn.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ₹{Number(txn.amount).toLocaleString('en-IN')}
                      </p>

                      <p className="text-xs">{txn.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No fraud transactions
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm">
                Never share OTP or personal details with anyone.
              </p>
            </div>

          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
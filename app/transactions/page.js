'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getCurrentUpi = () => {
    if (!user) return '';
    return `${user.primaryEmailAddress.emailAddress.split('@')[0]}@upi`;
  };

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000');
    const upiId = getCurrentUpi();

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/transactions/${upiId}`);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.log(err);
      }
    };

    socket.emit('join', upiId);
    fetchTransactions();

    socket.on('balanceUpdated', fetchTransactions);

    return () => socket.disconnect();
  }, [user]);

  const formattedTransactions = [...transactions]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .map((txn, index) => {
      const userUpi = getCurrentUpi();
      const isSent = txn.sender === userUpi;
      const isBlocked = txn.status === 'blocked';

      return {
        id: `${txn.sender}-${txn.receiver}-${txn.time}-${txn.amount}-${index}`,
        type: isBlocked ? 'blocked' : isSent ? 'sent' : 'received',
        name: isSent || isBlocked ? txn.receiver : txn.sender,
        upiId: isSent || isBlocked ? txn.receiver : txn.sender,
        amount: Number(txn.amount),
        timestamp: new Date(txn.time),
        status: txn.status === 'success' ? 'completed' : txn.status,
        riskReason: txn.reason || '',
      };
    });

  const filteredTransactions = formattedTransactions.filter((txn) => {
    const matchesSearch =
      txn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.upiId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || txn.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalTransactions: formattedTransactions.length,
    completed: formattedTransactions.filter((t) => t.status === 'completed').length,
    blocked: formattedTransactions.filter((t) => t.status === 'blocked').length,
    pending: formattedTransactions.filter((t) => t.status === 'pending').length,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Transactions"
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold">Transactions</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your transaction history
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total" value={stats.totalTransactions} />
              <StatCard label="Completed" value={stats.completed} />
              <StatCard label="Blocked" value={stats.blocked} />
              <StatCard label="Pending" value={stats.pending} />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or UPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'blocked', 'pending'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    onClick={() => setFilterStatus(status)}
                    className="rounded-full capitalize"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <TransactionRow key={txn.id} txn={txn} />
                ))
              ) : (
                <div className="bg-card border rounded-2xl p-8 text-center">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TransactionRow({ txn }) {
  const amountColor =
    txn.status === 'blocked'
      ? 'text-gray-500'
      : txn.type === 'sent'
      ? 'text-red-500'
      : 'text-green-600';

  const amountSign =
    txn.status === 'blocked'
      ? ''
      : txn.type === 'sent'
      ? '-'
      : '+';

  return (
    <div className="bg-card border rounded-2xl p-4 flex justify-between">
      <div>
        <p className="font-semibold">{txn.name}</p>
        <p className="text-sm text-muted-foreground">{txn.upiId}</p>
        <p className="text-xs text-muted-foreground">
          {txn.timestamp.toLocaleString()}
        </p>

        {txn.riskReason && (
          <p className="text-xs text-red-500 mt-1">{txn.riskReason}</p>
        )}
      </div>

      <div className="text-right">
        <p className={`font-bold ${amountColor}`}>
          {amountSign} ₹{txn.amount.toLocaleString('en-IN')}
        </p>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">
          {txn.status}
        </span>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { Input } from '@/components/ui/input';
import { Search, Download, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const PAGE_SIZE = 50;
const STATUS_OPTIONS = ['all', 'completed', 'blocked', 'otp_verified', 'pending'];

export default function TransactionsPage() {
  const { user } = useUser();
  const dateRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileType, setFileType] = useState('xlsx');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [showMobileDateModal, setShowMobileDateModal] = useState(false);

  const getCurrentUpi = () =>
    user ? `${user.primaryEmailAddress.emailAddress.split('@')[0]}@upi` : '';

  /* SOCKET (UNCHANGED) */
  useEffect(() => {
    if (!user) return;
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    const upiId = getCurrentUpi();

    const fetchTransactions = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${upiId}`);
      setTransactions(await res.json());
    };

    socket.emit('join', upiId);
    fetchTransactions();
    socket.on('balanceUpdated', fetchTransactions);

    return () => socket.disconnect();
  }, [user]);

  /* FIX 1: click outside date dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setShowDatePanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* FORMAT (UNCHANGED LOGIC) */
  const formattedTransactions = [...transactions]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .map((txn, i) => {
      const userUpi = getCurrentUpi();
      const isSent = txn.sender === userUpi;
      const isBlocked = txn.status === 'blocked';
      const isOtp =
        txn.status === 'otp_verified' ||
        txn.reason?.toLowerCase().includes('otp');

      return {
        id: `${txn.sender}-${txn.receiver}-${txn.time}-${i}`,
        type: isBlocked ? 'blocked' : isSent ? 'sent' : 'received',
        name: isSent || isBlocked ? txn.receiver : txn.sender,
        upiId: isSent || isBlocked ? txn.receiver : txn.sender,
        amount: Number(txn.amount),
        timestamp: new Date(txn.time),
        status: isOtp
          ? 'otp_verified'
          : txn.status === 'success'
            ? 'completed'
            : txn.status,
        riskReason: txn.reason || ''
      };
    });

  /* FILTER (UNCHANGED) */
  const filteredTransactions = formattedTransactions.filter(txn => {
    const search =
      txn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.upiId.toLowerCase().includes(searchTerm.toLowerCase());

    const status = filterStatus === 'all' || txn.status === filterStatus;

    const date =
      (!fromDate || txn.timestamp >= new Date(fromDate)) &&
      (!toDate || txn.timestamp <= new Date(`${toDate}T23:59:59`));

    return search && status && date;
  });

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE)
  );

  /* FIX 2: REAL XLSX + PDF export */
  const handleDownload = () => {
    const data = filteredTransactions.map(t => ({
      Date: t.timestamp.toLocaleString(),
      Name: t.name,
      UPI: t.upiId,
      Amount: t.amount,
      Status: t.status
    }));

    if (fileType === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      XLSX.writeFile(wb, 'transactions.xlsx');
    } else {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Date', 'Name', 'UPI', 'Amount', 'Status']],
        body: data.map(d => Object.values(d))
      });
      doc.save('transactions.pdf');
    }

    setShowDownloadModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">

            {/* TITLE (UNCHANGED) */}
            <div>
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your transaction history
              </p>
            </div>

            {/* STATS + DOWNLOAD BUTTON (ONLY MOBILE FIX: DUPLICATE REMOVED HERE NOT ADDED ANYTHING ELSE) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
              <StatCard label="Total" value={formattedTransactions.length} />
              <StatCard label="Completed" value={formattedTransactions.filter(t => t.status === 'completed').length} />
              <StatCard label="Blocked" value={formattedTransactions.filter(t => t.status === 'blocked').length} />
              <StatCard label="OTP Verified" value={formattedTransactions.filter(t => t.status === 'otp_verified').length} />
              <StatCard label="Pending" value={formattedTransactions.filter(t => t.status === 'pending').length} />

              {/* ONLY ONE DOWNLOAD BUTTON (kept, no duplicate added) */}
              <button
                onClick={() => setShowDownloadModal(true)}
                className="lg:hidden bg-blue-600 text-white rounded-xl p-4"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </div>
              </button>
            </div>

            {/* SEARCH (UNCHANGED) */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or UPI..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* FILTER ROW */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              {/* TOP: Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-3 flex-wrap">

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="border rounded-full px-4 py-2 bg-card"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="otp_verified">OTP Verified</option>
                    <option value="pending">Pending</option>
                  </select>

                  {/* DATE */}
                  <div ref={dateRef} className="relative">
                    <button
                      onClick={() => {
                        if (window.innerWidth < 640) {
                          setShowMobileDateModal(true); // mobile
                        } else {
                          setShowDatePanel(v => !v); // desktop
                        }
                      }}
                      className="border rounded-full px-4 py-2 flex items-center gap-2 bg-card"
                    >
                      <CalendarDays className="w-4 h-4" /> Date
                    </button>

                    {showDatePanel && (
                      <div className="hidden sm:block absolute left-0 z-30 mt-2 bg-card border rounded-xl p-3 shadow-lg">
                        <Input
                          className="w-full text-xs sm:text-sm px-2"
                          type="date"
                          value={fromDate}
                          onChange={e => setFromDate(e.target.value)}
                        />

                        <Input
                          className="w-full text-xs sm:text-sm px-2"
                          type="date"
                          value={toDate}
                          onChange={e => setToDate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:flex justify-end">
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 "
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>

                  {/* SEARCH (UNCHANGED) */}
                  <div className="relative"></div>

                </div>

              </div>

              {/* BOTTOM: Pagination + Download (MOBILE FIX) */}
              <div className="flex items-center justify-between">

                {/* PAGINATION */}
                <div className="flex items-center gap-2 text-xs sm:text-sm bg-muted px-3 py-1 rounded-full whitespace-nowrap ml-auto">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft />
                  </button>

                  <span className="whitespace-nowrap">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filteredTransactions.length)} of{' '}
                    {filteredTransactions.length}
                  </span>

                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight />
                  </button>

                </div>

              </div>
            </div>

            {/* LIST (UNCHANGED) */}
            <div className="space-y-3">
              {paginatedTransactions.length ? (
                paginatedTransactions.map(txn => (
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

      {showMobileDateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:hidden">

          <div className="bg-card w-full rounded-t-2xl p-4 space-y-4">

            <h2 className="text-lg font-semibold">Select Date Range</h2>

            <div className="space-y-3">
              <Input
                className="w-full"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />

              <Input
                className="w-full"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowMobileDateModal(false)}
              className="bg-blue-600 text-white w-full py-2 rounded-xl"
            >
              Apply
            </button>

            <button
              onClick={() => setShowMobileDateModal(false)}
              className="w-full border py-2 rounded-xl"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* DOWNLOAD MODAL (UNCHANGED UI) */}
      {showDownloadModal && (
        <DownloadModal
          fileType={fileType}
          setFileType={setFileType}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
        />
      )}

      <BottomNav />
    </div>
  );
}

/* UNCHANGED COMPONENTS BELOW */

function StatCard({ label, value }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col justify-between min-h-[90px]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function DownloadModal({ fileType, setFileType, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-card border rounded-2xl p-6 w-80 space-y-4">

        <h2 className="font-bold text-lg">Download Report</h2>

        <label className="flex gap-2">
          <input type="radio" checked={fileType === 'xlsx'} onChange={() => setFileType('xlsx')} />
          XLSX
        </label>

        <label className="flex gap-2">
          <input type="radio" checked={fileType === 'pdf'} onChange={() => setFileType('pdf')} />
          PDF
        </label>

        <button
          onClick={onDownload}
          className="bg-blue-600 text-white w-full py-2 rounded-xl"
        >
          Download
        </button>

        <button onClick={onClose} className="w-full border py-2 rounded-xl">
          Cancel
        </button>

      </div>
    </div>
  );
}

function TransactionRow({ txn }) {
  const color =
    txn.status === 'blocked'
      ? 'text-gray-500'
      : txn.type === 'sent'
        ? 'text-red-500'
        : 'text-green-600';

  const sign = txn.status === 'blocked' ? '' : txn.type === 'sent' ? '-' : '+';

  return (
    <div className="bg-card border rounded-2xl p-4 flex justify-between">
      <div>
        <p className="font-semibold">{txn.name}</p>
        <p className="text-sm text-muted-foreground">{txn.upiId}</p>
        <p className="text-xs text-muted-foreground">
          {txn.timestamp.toLocaleString()}
        </p>
      </div>

      <div className="text-right">
        <p className={`font-bold ${color}`}>
          {sign} ₹{txn.amount.toLocaleString('en-IN')}
        </p>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">
          {txn.status}
        </span>
      </div>
    </div>
  );
}
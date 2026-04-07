'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Search } from 'lucide-react';

export default function ContactsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);

  const { user, isLoaded } = useUser();
  const router = useRouter();

  const getUpiId = () =>
    user?.primaryEmailAddress?.emailAddress.split('@')[0] + '@upi';

  // ✅ FETCH TRANSACTIONS & GENERATE CONTACTS
  useEffect(() => {
    const fetchContacts = async () => {
      if (!isLoaded || !user) return;

      const res = await fetch(
        `http://localhost:5000/transactions/${getUpiId()}`
      );
      const data = await res.json();

      const map = {};

      data.forEach((t) => {
        const other =
          t.sender === getUpiId() ? t.receiver : t.sender;

        map[other] = (map[other] || 0) + 1;
      });

      const sorted = Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .map(([upiId, count]) => ({
          upiId,
          transactions: count,
        }));

      setContacts(sorted);
    };

    fetchContacts();
  }, [isLoaded, user]);

  // ✅ FILTER
  const filteredContacts = contacts.filter((c) =>
    c.upiId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = (upiId) => {
    router.push(`/send-money?upiId=${upiId}`);
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
          userName={user?.firstName || 'User'}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">

            {/* Back */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-primary font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Your Contacts</h1>
              <p className="text-muted-foreground">
                {filteredContacts.length} contacts
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by UPI ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* List */}
            {filteredContacts.length > 0 ? (
              <div className="space-y-3">
                {filteredContacts.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleContactClick(c.upiId)}
                    className="w-full flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted transition"
                  >
                    <div>
                      <p className="font-semibold">{c.upiId}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.transactions} transactions
                      </p>
                    </div>
                    <span className="text-primary">→</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                No contacts found
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
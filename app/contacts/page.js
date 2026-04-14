'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';

export default function ContactsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);

  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!isLoaded || !user) {
          setContacts([]);
          return;
        }

        const email =
          user.primaryEmailAddress?.emailAddress;

        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/email/${encodeURIComponent(email)}`
        );

        const profileData =
          await profileRes.json();

        const upiId =
          profileData?.upiId;

        if (!upiId) {
          setContacts([]);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/${upiId}`
        );

        const data = await res.json();

        const map = {};

        data.forEach((t) => {
          const other =
            t.sender === upiId
              ? t.receiver
              : t.sender;

          if (!other) return;

          map[other] =
            (map[other] || 0) + 1;
        });

        const sorted = await Promise.all(
          Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(async ([upiId, count]) => {
              let name = '';

              try {
                const userRes = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/user/${encodeURIComponent(upiId)}`
                );

                if (userRes.ok) {
                  const userData = await userRes.json();
                  name = userData?.name || '';
                }
              } catch (e) {
                console.log(e);
              }

              return {
                upiId,
                name,
                transactions: count,
              };
            })
        );

        setContacts(sorted);
      } catch (error) {
        console.log(error);
      }
    };

    fetchContacts();
  }, [isLoaded, user]);

  const filteredContacts =
    contacts.filter((c) =>
      c.upiId
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  const handleContactClick = (
    upiId,
    name
  ) => {
    router.push(
      `/send-money?receiver=${encodeURIComponent(
        upiId
      )}&name=${encodeURIComponent(name)}`
    );
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col">
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
          <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary font-medium hover:opacity-80 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>

            <div>
              <h1 className="text-3xl font-bold">
                Your Contacts
              </h1>

              <p className="text-muted-foreground mt-1">
                {
                  filteredContacts.length
                }{' '}
                contacts
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <Input
                placeholder="Search by UPI ID..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="pl-12 h-12 rounded-xl"
              />
            </div>

            {filteredContacts.length >
              0 ? (
              <div className="space-y-3">
                {filteredContacts.map(
                  (c, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        handleContactClick(
                          c.upiId,
                          c.name
                        )
                      }
                      className="w-full flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm hover:bg-muted transition cursor-pointer"
                    >
                      <div className="text-left">
                        <div>
                          <p className="font-semibold text-base">
                            {c.name || c.upiId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {c.upiId}
                          </p>
                        </div>


                        <p className="text-sm text-muted-foreground mt-1">
                          {
                            c.transactions
                          }{' '}
                          transactions
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-primary" />
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
                No contacts found
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
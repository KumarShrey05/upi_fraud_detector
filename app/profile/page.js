'use client';

import { useState } from 'react';
import { Mail, Copy, QrCode, User, Phone, MapPin } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = {
    name: 'Arjun Patel',
    email: 'arjun.patel@example.com',
    phone: '+91 98765 43210',
    upiId: 'arjun@okhdfcbank',
    location: 'Mumbai, India',
    joinDate: 'Jan 2024',
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(user.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Profile"
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-center text-white">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-white/80 mt-2">
                Member since {user.joinDate}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">UPI ID</h2>
              <div className="flex items-center justify-between bg-input rounded-xl p-4">
                <span className="font-mono font-semibold text-foreground">
                  {user.upiId}
                </span>
                <button
                  onClick={handleCopyUPI}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-500 font-medium">
                  Copied to clipboard!
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">QR Code</h2>
              <div className="bg-input rounded-xl p-6 flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-muted">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Contact Information
              </h2>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5" />
                <p>{user.email}</p>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5" />
                <p>{user.phone}</p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5" />
                <p>{user.location}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
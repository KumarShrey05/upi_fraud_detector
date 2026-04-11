'use client';

import { useEffect, useState } from 'react';
import { Mail, Copy, User, Phone, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const upiId =
          localStorage.getItem('upiId') ||
          localStorage.getItem('userUpiId');

        console.log('UPI ID from localStorage:', upiId);

        if (!upiId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/user/profile/${encodeURIComponent(
            upiId
          )}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();

        console.log('Fetched user:', data);

        setUser(data);
      } catch (error) {
        console.log('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleCopyUPI = () => {
    if (!user?.upiId) return;

    navigator.clipboard.writeText(user.upiId);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User profile not found
      </div>
    );
  }

  const qrValue = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(
    user.name
  )}`;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user.name}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-center text-white">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10" />
              </div>

              <h1 className="text-3xl font-bold">{user.name}</h1>

<p className="text-white/80 mt-2">
  Member since {user.joinDate}
</p>
            </div>

            {/* UPI ID */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                UPI ID
              </h2>

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

            {/* QR Code */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                QR Code
              </h2>

              <div className="bg-input rounded-xl p-6 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={qrValue} size={180} />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Contact Information
              </h2>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5" />
                <p>{user.email || 'Not available'}</p>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5" />
                <p>{user.phone || 'Not available'}</p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5" />
                <p>{user.location || 'Not available'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
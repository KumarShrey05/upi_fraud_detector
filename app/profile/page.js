'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Copy, User, Phone, MapPin, Download, Share2, Pencil } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const qrRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const upiId = localStorage.getItem('upiId') || localStorage.getItem('userUpiId');
        if (!upiId) return setLoading(false);

        const res = await fetch(`http://localhost:5000/api/user/profile/${encodeURIComponent(upiId)}`);
        const data = await res.json();

        setUser(data);
        setPhone(data.phone || '');
        setLocation(data.location || '');
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const openEdit = () => {
    setTempPhone(phone);
    setTempLocation(location);
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      await fetch(`http://localhost:5000/user/${encodeURIComponent(user.upiId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: tempPhone, location: tempLocation })
      });

      setPhone(tempPhone);
      setLocation(tempLocation);
      setEditOpen(false);

      toast({
        title: 'Profile updated',
        description: 'Changes saved successfully'
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(user.upiId);

    toast({
      title: 'UPI copied',
      description: 'Copied to clipboard'
    });
  };

  const handleDownloadQR = async () => {
    const svg = qrRef.current.querySelector('svg');
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(svg)], { type: 'image/svg+xml' });

    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${user.name}-upi-qr.svg`
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name}-upi-qr.svg`;
      link.click();
    }

    toast({
      title: 'QR saved',
      description: 'Download complete'
    });
  };

  const handleShare = async () => {
    const text = `Pay me via UPI: ${user.upiId}`;

    if (navigator.share) {
      await navigator.share({ title: 'UPI ID', text });
    } else {
      await navigator.clipboard.writeText(text);
    }

    toast({
      title: 'Ready to share'
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;

  const qrValue = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}`;
  const completion = [user.name, user.email, phone, location].filter(Boolean).length * 25;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-background to-primary/5">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userName={user.name} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">

            {/* Header */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl p-8 text-center text-white shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10" />
              </div>

              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-white/80 mt-2">Member since {user.joinDate}</p>

              <div className="mt-5">
                <p className="text-sm">Profile Completion {completion}%</p>

                <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-2 bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>

            {/* UPI */}
            <div className="bg-white/75 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold">UPI ID</h2>

              <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-sm">
                <span className="font-mono font-semibold">{user.upiId}</span>

                <button
                  onClick={handleCopyUPI}
                  className="cursor-pointer rounded-xl bg-primary text-white p-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* QR */}
            <div className="bg-white/75 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold">QR Code</h2>

              <div ref={qrRef} className="bg-white/40 rounded-xl p-6 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QRCode value={qrValue} size={180} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="cursor-pointer rounded-xl bg-primary text-white p-3 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={handleShare}
                  className="cursor-pointer rounded-xl bg-primary text-white p-3 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/75 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Contact Information</h2>

                <button
                  onClick={openEdit}
                  className="cursor-pointer rounded-full bg-primary/10 text-primary p-2 shadow-sm hover:bg-primary hover:text-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <GlassRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
              <GlassRow icon={<Phone className="w-4 h-4" />} label="Phone" value={phone || 'Not available'} />
              <GlassRow icon={<MapPin className="w-4 h-4" />} label="Location" value={location || 'Not available'} />
            </div>

            {/* Edit Modal */}
            {editOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
                  <h2 className="text-lg font-bold">Edit Contact Info</h2>

                  <input value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} placeholder="Phone" className="w-full border rounded-xl p-3 bg-white/80" />
                  <input value={tempLocation} onChange={(e) => setTempLocation(e.target.value)} placeholder="Location" className="w-full border rounded-xl p-3 bg-white/80" />

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 rounded-xl bg-primary text-white p-3 shadow-md hover:shadow-xl hover:opacity-90 active:scale-95 transition-all"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditOpen(false)}
                      className="flex-1 rounded-xl border border-muted-foreground/20 bg-background p-3 shadow-sm hover:bg-muted hover:shadow-md transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function GlassRow({ icon, label, value }) {
  return (
    <div className="cursor-pointer rounded-2xl bg-white/40 backdrop-blur-lg border border-white/20 px-4 py-4 flex items-center gap-3 hover:shadow-md transition-all">
      <div className="rounded-xl bg-primary/10 text-primary p-2">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
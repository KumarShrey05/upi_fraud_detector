'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import {
  Mail,
  Copy,
  User,
  Phone,
  MapPin,
  Download,
  Share2,
  Pencil
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();

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
    if (!isLoaded) return;

    const fetchUser = async () => {
      try {
        if (!clerkUser) {
          localStorage.removeItem('upiId');
          localStorage.removeItem('userUpiId');
          setUser(null);
          setPhone('');
          setLocation('');
          setLoading(false);
          return;
        }

        const email =
          clerkUser.primaryEmailAddress?.emailAddress;

        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/email/${encodeURIComponent(email)}`
        );

        const userData = await userRes.json();

        if (!userData?.upiId) {
          setUser(null);
          setLoading(false);
          return;
        }

        localStorage.setItem(
          'upiId',
          userData.upiId
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/${encodeURIComponent(
            userData.upiId
          )}`
        );

        const data = await res.json();

        setUser(data);
        setPhone(data.phone || '');
        setLocation(data.location || '');
      } catch (e) {
        console.log(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [clerkUser, isLoaded]);

  const openEdit = () => {
    setTempPhone(phone);
    setTempLocation(location);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${encodeURIComponent(user.upiId)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: tempPhone,
            location: tempLocation
          })
        }
      );

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
    if (!user?.upiId) return;

    await navigator.clipboard.writeText(user.upiId);

    toast({
      title: 'UPI copied',
      description: 'Copied to clipboard'
    });
  };

  const generateQRBlob = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !user) return null;

    const svgData =
      new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement('canvas');
    const size = 600;
    const margin = 80;
    const headerHeight = 90;
    const footerHeight = 80;

    canvas.width = size + margin * 2;
    canvas.height = 760;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      user.name || '',
      canvas.width / 2,
      35
    );

    const img = new window.Image();
    const logo = new window.Image();

    return new Promise((resolve) => {
      img.onload = () => {
        const qrY = 70;

        ctx.drawImage(
          img,
          margin,
          qrY,
          size,
          size
        );

        logo.onload = () => {
          const logoSize = 90;

          ctx.drawImage(
            logo,
            canvas.width / 2 - logoSize / 2,
            qrY + size / 2 - logoSize / 2,
            logoSize,
            logoSize
          );

          ctx.fillStyle = '#4b5563';
          ctx.font = '20px monospace';
          ctx.fillText(
            user.upiId || '',
            canvas.width / 2,
            695
          );

          canvas.toBlob(
            (blob) => resolve(blob),
            'image/png',
            1.0
          );
        };

        logo.src = '/half logo.svg';
      };

      img.src =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(svgData);
    });
  };

  const handleDownloadQR = async () => {
    if (!user) return;

    try {
      const blob = await generateQRBlob();
      if (!blob) return;

      const fileName = `${user.name}-upi-qr.png`;

      if ('showSaveFilePicker' in window) {
        const handle =
          await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'PNG Image',
                accept: {
                  'image/png': ['.png']
                }
              }
            ]
          });

        const writable =
          await handle.createWritable();

        await writable.write(blob);
        await writable.close();
      } else {
        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement('a');

        link.href = url;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(url);
      }

      toast({
        title: 'QR saved',
        description:
          'PNG downloaded successfully'
      });
    } catch (error) {
      if (error.name === 'AbortError')
        return;
    }
  };

  const handleShare = async () => {
    if (!user?.upiId) return;

    const blob = await generateQRBlob();
    if (!blob) return;

    const file = new File(
      [blob],
      `${user.name}-upi-qr.png`,
      { type: 'image/png' }
    );

    const text = `Please Find my UPI Details
Name:- ${user.name}
UPI ID:- ${user.upiId}`;

    try {
      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file]
        })
      ) {
        await navigator.share({
          title: 'UPI Details',
          text,
          files: [file]
        });
      } else {
        await navigator.clipboard.writeText(
          text
        );
      }

      toast({
        title: 'Ready to share'
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const qrValue = user?.upiId
    ? `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(
      user.name || ''
    )}`
    : '';

  const completion = user
    ? [
      user.name,
      user.email,
      phone,
      location
    ].filter(Boolean).length * 25
    : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          userName={
            user?.name || 'Guest'
          }
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl p-8 text-center text-white shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10" />
              </div>

              <h1 className="text-3xl font-bold">
                {user?.name || ''}
              </h1>

              <p className="text-white/80 mt-2">
                {user?.joinDate
                  ? `Member since ${user.joinDate}`
                  : ''}
              </p>

              <div className="mt-5">
                <p className="text-sm">
                  Profile Completion{' '}
                  {completion}%
                </p>

                <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-2 bg-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${completion}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <Card>
              <h2 className="text-lg font-bold">
                UPI ID
              </h2>

              <div className="flex items-center justify-between bg-muted dark:bg-slate-800/70 rounded-xl p-4 shadow-sm">
                <span className="font-mono font-semibold">
                  {user?.upiId || ''}
                </span>

                <ActionIconBtn
                  onClick={handleCopyUPI}
                >
                  <Copy className="w-4 h-4" />
                </ActionIconBtn>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold">
                QR Code
              </h2>

              <div
                ref={qrRef}
                className="bg-muted dark:bg-slate-800/70 rounded-xl p-6 flex items-center justify-center min-h-[220px]"
              >

                {user?.upiId ? (
                  <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {user.name}
                    </p>

                    <div className="relative">
                      <QRCode
                        value={qrValue}
                        size={180}
                        level="H"
                      />

                      <Image
                        src="/half logo.svg"
                        alt="UPay Logo"
                        width={35}
                        height={35}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    </div>

                    <p className="text-[11px] font-mono text-slate-600 mt-2">
                      {user.upiId}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PrimaryBtn
                  onClick={handleDownloadQR}
                >
                  <Download className="w-4 h-4" />
                  Download
                </PrimaryBtn>

                <PrimaryBtn
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </PrimaryBtn>
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  Contact Information
                </h2>

                <ActionIconBtn
                  onClick={openEdit}
                >
                  <Pencil className="w-4 h-4" />
                </ActionIconBtn>
              </div>

              <InfoRow
                icon={
                  <Mail className="w-4 h-4" />
                }
                label="Email"
                value={user?.email || ''}
              />

              <InfoRow
                icon={
                  <Phone className="w-4 h-4" />
                }
                label="Phone"
                value={phone || ''}
              />

              <InfoRow
                icon={
                  <MapPin className="w-4 h-4" />
                }
                label="Location"
                value={location || ''}
              />
            </Card>

            {editOpen && user && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
                  <h2 className="text-lg font-bold">
                    Edit Contact Info
                  </h2>

                  <input
                    value={tempPhone}
                    onChange={(e) =>
                      setTempPhone(
                        e.target.value
                      )
                    }
                    placeholder="Phone"
                    className="w-full border border-border dark:border-slate-700 rounded-xl p-3 bg-background dark:bg-slate-800"
                  />

                  <input
                    value={tempLocation}
                    onChange={(e) =>
                      setTempLocation(
                        e.target.value
                      )
                    }
                    placeholder="Location"
                    className="w-full border border-border dark:border-slate-700 rounded-xl p-3 bg-background dark:bg-slate-800"
                  />

                  <div className="flex gap-3">
                    <PrimaryBtn
                      onClick={handleSave}
                    >
                      Save
                    </PrimaryBtn>

                    <button
                      onClick={() =>
                        setEditOpen(false)
                      }
                      className="flex-1 rounded-xl border border-border dark:border-slate-700 p-3 bg-background dark:bg-slate-800 hover:scale-[1.05] cursor-pointer hover:shadow-lg transition duration-200"
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

function Card({ children }) {
  return (
    <div className="rounded-2xl p-6 space-y-4 shadow-xl border border-border bg-card dark:bg-slate-900/80 dark:border-slate-700 backdrop-blur-xl dark:shadow-[0_10px_40px_rgba(59,130,246,0.12)]">
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-xl p-3 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 flex-1 bg-primary text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500"
    >
      {children}
    </button>
  );
}

function ActionIconBtn({
  children,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-full p-2 shadow-sm transition-all hover:scale-110 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value
}) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md bg-muted dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700 hover:scale-[1.02]">
      <div className="rounded-xl bg-primary/10 text-primary dark:bg-cyan-500/10 dark:text-cyan-400 p-2">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground ">
          {label}
        </p>

        <p className="font-medium text-foreground dark:text-slate-100 ">
          {value}
        </p>
      </div>
    </div>
  );
}

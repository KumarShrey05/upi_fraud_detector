'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { HeroCarousel } from '@/components/cards/Hero-carousel';
import { QuickActions } from '@/components/cards/Quick-actions';
import { FrequentContacts } from '@/components/cards/Frequent-contacts';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [showProfileForm, setShowProfileForm] =
    useState(false);

  const [phone, setPhone] = useState('');
  const [location, setLocation] =
    useState('');
  const [profileCompleted, setProfileCompleted] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const [showSplash, setShowSplash] =
    useState(true);

  const { user, isLoaded } = useUser();

  const showToastMessage = (
    message,
    type = 'success'
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type,
      });
    }, 2500);
  };

  // =========================
  // SPLASH LOADER + WAKE BACKEND + ML SERVICE
  // =========================
  useEffect(() => {
    const minimumSplashTime = 3000;
    const startTime = Date.now();

    const wakeServices = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`
        );
      } catch (error) {
        console.error("Wake failed:", error);
      } finally {
        const elapsed =
          Date.now() - startTime;

        const remaining =
          minimumSplashTime - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            setShowSplash(false);
          }, remaining);
        } else {
          setShowSplash(false);
        }
      }
    };

    wakeServices();
  }, []);

  // =========================
  // REGISTER USER
  // =========================
  useEffect(() => {
    const registerUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              name:
                user.fullName ||
                user.firstName ||
                'User',
              email:
                user
                  .primaryEmailAddress
                  ?.emailAddress,
            }),
          }
        );

        const data = await res.json();

        console.log(
          'REGISTER RESPONSE:',
          data
        );

        if (data.upiId) {
          localStorage.setItem(
            'upiId',
            data.upiId
          );
        }

        if (
          !profileCompleted &&
          (!data.phone || !data.location)
        ) {
          setShowProfileForm(true);
        }
      } catch (error) {
        console.log(
          'Register error:',
          error
        );
      }
    };

    registerUser();
  }, [user, isLoaded]);

  // =========================
  // RECEIVE PAYMENT TOAST
  // =========================
  useEffect(() => {
    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL}`
    );

    const upiId =
      localStorage.getItem('upiId');

    if (upiId) {
      socket.emit('join', upiId);
    }

    socket.on(
      'paymentReceived',
      ({ sender, amount }) => {
        showToastMessage(
          `₹${amount} received from ${sender}`,
          'success'
        );
      }
    );

    return () =>
      socket.disconnect();
  }, []);

  const saveProfileDetails =
    async () => {
      try {
        setSavingProfile(true);

        const upiId =
          localStorage.getItem(
            'upiId'
          );

        if (!upiId) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${upiId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              phone,
              location,
            }),
          }
        );

        if (!res.ok) {
          showToastMessage(
            'Failed to save profile',
            'error'
          );
          return;
        }

        setProfileCompleted(true);
        setShowProfileForm(false);

        showToastMessage(
          'Profile updated successfully',
          'success'
        );
      } catch (error) {
        console.log(
          'Profile save error:',
          error
        );
      } finally {
        setSavingProfile(false);
      }
    };

  if (showSplash) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#02040a] flex flex-col items-center justify-center">

        {/* base cinematic background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#102a5c_0%,_#020617_45%,_#000000_100%)]" />

        {/* Top Neon Curves */}
        <div className="absolute top-[-2%] w-[130%] h-[180px] opacity-90">
          <div className="absolute top-6 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(251,146,60,0.7)]" />
          <div className="absolute top-14 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(96,165,250,0.8)]" />
          <div className="absolute top-22 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(192,132,252,0.8)]" />
        </div>

        {/* Center Beam + Spotlight */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[140%] h-[140px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute w-[80%] h-[20px] bg-cyan-400/20 blur-[40px]" />
          <div className="absolute top-[58%] w-72 h-12 rounded-full bg-cyan-300/30 blur-[30px]" />
          <div className="absolute w-40 h-40 bg-blue-300/25 rounded-full blur-[80px]" />
        </div>

        {/* Bottom Neon Curves */}
        <div className="absolute bottom-[-2%] w-[130%] h-[180px] opacity-90">
          <div className="absolute bottom-22 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(251,146,60,0.7)]" />
          <div className="absolute bottom-14 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(96,165,250,0.8)]" />
          <div className="absolute bottom-6 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[1px] shadow-[0_0_20px_rgba(192,132,252,0.8)]" />
        </div>

        {/* grain texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* content */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/half-logo.png"
            alt="UPay"
            width={260}
            height={260}
            priority
            className="object-contain drop-shadow-2xl"
          />

          <h1 className="mt-6 text-5xl font-bold text-white tracking-wide">
            UPay
          </h1>

          <p className="mt-4 text-xl text-white/90">
            Secure UPI Transactions
          </p>

          <p className="mt-4 text-base text-slate-400">
            Built by Kumar Shrey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          userName={
            user?.firstName || 'Home'
          }
        />

        {/* Toast */}
        {toast.show && (
          <div className="fixed top-20 right-0 z-50 toast-edge-slide">
            <div
              className={`w-80 rounded-l-xl border-l border-t border-b shadow-2xl px-4 py-3 ${toast.type ===
                'error'
                ? 'bg-red-600/95 border-red-500 text-white'
                : 'bg-green-600/95 border-green-500 text-white'
                }`}
            >
              <p className="text-sm font-semibold">
                {toast.message}
              </p>
            </div>
          </div>
        )}

        {/* Profile Popup */}
        {showProfileForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
              <h2 className="text-xl font-bold mb-4">
                Complete Your
                Profile
              </h2>

              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3 mb-4"
              />

              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3 mb-4"
              />

              <button
                onClick={saveProfileDetails}
                disabled={savingProfile}
                className="w-full bg-blue-500 text-white py-3 rounded-xl disabled:opacity-50"
              >
                {savingProfile
                  ? 'Saving...'
                  : 'Save Details'}
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto">
            <HeroCarousel />
            <QuickActions />
            <FrequentContacts />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
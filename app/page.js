'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';
import { HeroCarousel } from '@/components/cards/Hero-carousel';
import { QuickActions } from '@/components/cards/Quick-actions';
import { FrequentContacts } from '@/components/cards/Frequent-contacts';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showProfileForm, setShowProfileForm] =
    useState(false);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const { user, isLoaded } = useUser();

  // Register user on first load
  useEffect(() => {
    const registerUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch(
          'http://localhost:5000/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name:
                user.fullName ||
                user.firstName ||
                'User',
              email:
                user.primaryEmailAddress
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

        if (!data.phone || !data.location) {
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

  const saveProfileDetails = async () => {
    try {
      const upiId =
        localStorage.getItem('upiId');

      await fetch(
        `http://localhost:5000/user/${upiId}`,
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

      setShowProfileForm(false);
    } catch (error) {
      console.log(
        'Profile save error:',
        error
      );
    }
  };

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

        {/* Profile Popup */}
        {showProfileForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl">
              <h2 className="text-xl font-bold mb-4">
                Complete Your Profile
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
                onClick={
                  saveProfileDetails
                }
                className="w-full bg-blue-500 text-white py-3 rounded-xl"
              >
                Save Details
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
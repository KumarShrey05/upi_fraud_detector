'use client';

import { Bell, Menu, X, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

export function Topbar(props = {}) {
  const { onMenuClick } = props;
  const { user, isLoaded } = useUser();

  const displayName =
    isLoaded && user
      ? user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      'User'
      : 'User';

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const notificationRef = useRef(null);
  const userInitial = displayName.charAt(0).toUpperCase();

  const showToastMessage = (message, type = 'success') => {
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

  useEffect(() => {
    const loadNotifications = () => {
      const saved =
        JSON.parse(
          localStorage.getItem('notifications')
        ) || [];

      setNotifications(saved);
    };

    loadNotifications();

    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    window.addEventListener(
      'storage',
      loadNotifications
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );

      window.removeEventListener(
        'storage',
        loadNotifications
      );
    };
  }, []);

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
        const message = `₹${amount} received from ${sender}`;

        const existing =
          JSON.parse(
            localStorage.getItem('notifications')
          ) || [];

        const updated = [
          {
            id: Date.now(),
            message,
            time: new Date().toLocaleTimeString(
              'en-IN'
            ),
          },
          ...existing,
        ].slice(0, 5);

        localStorage.setItem(
          'notifications',
          JSON.stringify(updated)
        );

        setNotifications(updated);
        showToastMessage(message, 'success');
      }
    );

    return () =>
      socket.disconnect();
  }, []);

  const clearNotification = (id) => {
    const updated =
      notifications.filter(
        (item) => item.id !== id
      );

    setNotifications(updated);

    localStorage.setItem(
      'notifications',
      JSON.stringify(updated)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem(
      'notifications'
    );
  };

  return (
    <>
      {toast.show && (
        <div className="fixed top-20 right-0 z-[9999] toast-edge-slide">
          <div
            className={`w-80 rounded-l-xl border-l border-t border-b shadow-2xl px-4 py-3 ${toast.type === 'error'
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

      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between h-17 px-4 sm:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* MOBILE BRAND */}

            <Link
              href="/"
              className="md:hidden flex items-center border-0 outline-none shadow-none"
            >
              <div className="block dark:hidden">
                <Image
                  src="/full-logo.svg"
                  alt="UPay"
                  width={120}
                  height={40}
                  priority
                  className="border-0 shadow-none outline-none"
                />
              </div>

              <div className="hidden dark:block">
                <Image
                  src="/full-logo-dark-mode.png"
                  alt="UPay"
                  width={120}
                  height={40}
                  priority
                  className="border-0 shadow-none outline-none"
                />
              </div>
            </Link>

            {/* DESKTOP WELCOME */}
            <h1 className="hidden md:block text-lg font-semibold text-foreground">
              Welcome {displayName}
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 ">
            <div
              className="relative"
              ref={notificationRef}
            >
              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <Bell className="w-5 h-5 " />

                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full " />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50 ">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">
                      Notifications
                    </h3>

                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto ">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-muted/50 flex justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {item.message}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              {item.time}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              clearNotification(item.id)
                            }
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/dashboard">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition">
                {userInitial}
              </div>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
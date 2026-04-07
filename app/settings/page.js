'use client';

import { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Lock,
  Eye,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);
  const [biometricEnabled, setBiometricEnabled] =
    useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName="Settings"
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
            {/* Display */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold">
                Display Settings
              </h2>

              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle theme
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDarkModeToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold">
                Notifications
              </h2>

              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <p>Push Notifications</p>
                </div>

                <button
                  onClick={() =>
                    setNotificationsEnabled(
                      !notificationsEnabled
                    )
                  }
                  className={`relative w-12 h-6 rounded-full ${
                    notificationsEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationsEnabled
                        ? 'translate-x-6'
                        : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold">Security</h2>

              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5" />
                  <p>Biometric Login</p>
                </div>

                <button
                  onClick={() =>
                    setBiometricEnabled(
                      !biometricEnabled
                    )
                  }
                  className={`relative w-12 h-6 rounded-full ${
                    biometricEnabled
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      biometricEnabled
                        ? 'translate-x-6'
                        : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between py-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" />
                  <p>Change Password</p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* Logout */}
            <button className="w-full bg-red-600 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
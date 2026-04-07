'use client';

import { Button } from '@/components/ui/button';
import { Bell, User, Menu } from 'lucide-react';
import { useState } from 'react';

export function Topbar(props = {}) {
  const { onMenuClick, userName = 'User' } = props;
  const [showNotifications, setShowNotifications] =
    useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 flex justify-center md:justify-start">
          <h1 className="text-lg font-semibold text-foreground">
            Welcome, {userName}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />

              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg p-4">
                <h3 className="font-semibold mb-3">
                  Notifications
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">
                      Transaction completed
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      2 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <User className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
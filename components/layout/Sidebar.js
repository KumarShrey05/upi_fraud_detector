'use client';

import {
  CreditCard,
  Home,
  Send,
  History,
  LogOut,
  X,
  AlertTriangle,
  Calendar,
  User,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const mainLinks = [
  { href: '/', label: 'Home', icon: Home },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: CreditCard,
  },
  {
    href: '/send-money',
    label: 'Send Money',
    icon: Send,
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: History,
  },
];

const secondaryLinks = [
  {
    href: '/fraud-list',
    label: 'Fraud List',
    icon: AlertTriangle,
  },
  {
    href: '/monthly-tracking',
    label: 'Monthly Tracking',
    icon: Calendar,
  },
  { href: '/profile', label: 'Profile', icon: User },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar(props = {}) {
  const { isOpen = true, onClose } = props;
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 flex flex-col',
          'md:translate-x-0',
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>

            <h2 className="text-lg font-bold text-foreground">
              UPay
            </h2>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          <div className="space-y-2">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href;

              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-4">
              More
            </p>

            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
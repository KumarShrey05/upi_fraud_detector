'use client';

import { Send, QrCode, History, Wallet } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    label: 'Send Money',
    icon: Send,
    href: '/send-money',
    color: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Scan QR',
    icon: QrCode,
    href: '/scan',
    color: 'from-purple-500 to-purple-600',
  },
  {
    label: 'History',
    icon: History,
    href: '/transactions',
    color: 'from-orange-500 to-orange-600',
  },
  {
    label: 'Balance',
    icon: Wallet,
    href: '/balance',
    color: 'from-green-500 to-green-600',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const Component = action.href === '#' ? 'button' : Link;

        return (
          <Component
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br opacity-90 hover:opacity-100 transition-opacity"
            style={{
              backgroundImage: `linear-gradient(to bottom right, var(--color-${action.color.split(' ')[1]}), var(--color-${action.color.split(' ')[3]}))`,
            }}
          >
            <div className={`bg-gradient-to-br ${action.color} p-3 rounded-xl`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground text-center">
              {action.label}
            </span>
          </Component>
        );
      })}
    </div>
  );
}

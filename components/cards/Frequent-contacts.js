'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const defaultContacts = [
  {
    id: '1',
    name: 'Raj Kumar',
    upiId: 'raj.kumar@upi',
    initials: 'RK',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: '2',
    name: 'Priya Singh',
    upiId: 'priya.singh@upi',
    initials: 'PS',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: '3',
    name: 'Arjun Patel',
    upiId: 'arjun.patel@upi',
    initials: 'AP',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: '4',
    name: 'Neha Verma',
    upiId: 'neha.verma@upi',
    initials: 'NV',
    color: 'from-green-500 to-green-600',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    upiId: 'vikram.singh@upi',
    initials: 'VS',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: '6',
    name: 'Sneha Gupta',
    upiId: 'sneha.gupta@upi',
    initials: 'SG',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export function FrequentContacts(props = {}) {
  const { contacts = defaultContacts } = props;
  const router = useRouter();

  const handleContactClick = (contact) => {
    router.push(`/send-money?contact=${contact.upiId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Frequent Contacts</h3>
        <Link href="/contacts" className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleContactClick(contact)}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow`}>
              {contact.initials}
            </div>

            <p className="text-xs text-center font-medium text-foreground line-clamp-2 w-full">
              {contact.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

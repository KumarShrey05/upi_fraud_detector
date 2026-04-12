'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FrequentContacts() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [contacts, setContacts] =
    useState([]);

  useEffect(() => {
    const fetchContacts =
      async () => {
        if (
          !isLoaded ||
          !user
        )
          return;

        try {
          const senderUpi =
            user.primaryEmailAddress.emailAddress.split(
              '@'
            )[0] + '@upi';

          const txnRes =
            await fetch(
              `http://localhost:5000/transactions/${senderUpi}`
            );

          const transactions =
            await txnRes.json();

          const successfulPayees =
            [
              ...new Set(
                transactions
                  .filter(
                    (txn) =>
                      txn.sender ===
                        senderUpi &&
                      txn.status ===
                        'success'
                  )
                  .map(
                    (txn) =>
                      txn.receiver
                  )
              ),
            ].slice(0, 6);

          const contactPromises =
            successfulPayees.map(
              async (
                upiId,
                index
              ) => {
                const userRes =
                  await fetch(
                    `http://localhost:5000/user/${upiId}`
                  );

                const userData =
                  await userRes.json();

                return {
                  id: String(
                    index + 1
                  ),
                  name:
                    userData.name ||
                    'User',
                  upiId,
                  initials:
                    userData.name
                      ?.split(
                        ' '
                      )
                      .map(
                        (
                          word
                        ) =>
                          word[0]
                      )
                      .join(
                        ''
                      )
                      .slice(
                        0,
                        2
                      )
                      .toUpperCase() ||
                    'U',
                  color:
                    [
                      'from-blue-500 to-blue-600',
                      'from-purple-500 to-purple-600',
                      'from-pink-500 to-pink-600',
                      'from-green-500 to-green-600',
                      'from-orange-500 to-orange-600',
                      'from-indigo-500 to-indigo-600',
                    ][
                      index %
                        6
                    ],
                };
              }
            );

          const finalContacts =
            await Promise.all(
              contactPromises
            );

          setContacts(
            finalContacts
          );
        } catch (error) {
          console.log(
            'Frequent contacts error:',
            error
          );
        }
      };

    fetchContacts();
  }, [user, isLoaded]);

  const handleContactClick = (
    contact
  ) => {
    router.push(
      `/send-money?contact=${contact.upiId}`
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Frequent
          Contacts
        </h3>

        <Link
          href="/contacts"
          className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
        >
          See More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {contacts.length ===
        0 ? (
          <p className="text-sm text-muted-foreground col-span-full">
            No recent
            contacts
          </p>
        ) : (
          contacts.map(
            (
              contact
            ) => (
              <button
                key={
                  contact.id
                }
                onClick={() =>
                  handleContactClick(
                    contact
                  )
                }
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors group"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  {
                    contact.initials
                  }
                </div>

                <p className="text-xs text-center font-medium text-foreground line-clamp-2 w-full">
                  {
                    contact.name
                  }
                </p>
              </button>
            )
          )
        )}
      </div>
    </div>
  );
}
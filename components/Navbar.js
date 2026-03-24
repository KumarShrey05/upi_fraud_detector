"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className="bg-[var(--card)] border-b border-[var(--border)] shadow p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl hover:scale-110 transition duration-300">
        <Link href="/dashboard">UPay</Link>
      </h1>

      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="hover:opacity-70">
          Dashboard
        </Link>

        <Link href="/send-money" className="hover:opacity-70">
          Send
        </Link>

        <Link href="/transactions" className="hover:opacity-70">
          Transactions
        </Link>

        <Link href="/fraud-list" className="hover:opacity-70">
          Fraud List
        </Link>

        <Link href="/scan" className="hover:opacity-70">
          Scan
        </Link>

        <ThemeToggle />
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <h1 className="font-bold text-xl text-black hover:scale-120 transition duration-500">
        <Link href="/dashboard">
          UPay
        </Link>
      </h1>

      <div className="flex gap-6 ">
        <Link href="/dashboard" className="text-blue-600 hover:shadow-2xs">
          Dashboard
        </Link>

        <Link href="/send-money" className="text-blue-600 hover:shadow-2xs">
          Send
        </Link>

        <Link href="/transactions" className="text-blue-600 hover:shadow-2xs">
          Transactions
        </Link>

        <Link href="/fraud-list" className="text-blue-600 hover:shadow-2xs">
          Fraud List
        </Link>

        <Link href="/scan" className="text-blue-600 hover:shadow-2xs">
          Scan
        </Link>
      </div>
    </div>
  );
}
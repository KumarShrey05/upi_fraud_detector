"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h1 className="font-bold text-xl text-black">
        UPay
      </h1>

      <div className="flex gap-6">

        <Link href="/dashboard" className="text-blue-600">
          Dashboard
        </Link>

        <Link href="/send-money" className="text-blue-600">
          Send
        </Link>

        <Link href="/transactions" className="text-blue-600">
          Transactions
        </Link>

        <Link href="/admin" className="text-blue-600">
          Fraud List
        </Link>

        <Link href="/scan" className="text-blue-600">
          Scan
        </Link>

      </div>

    </div>
  )
}
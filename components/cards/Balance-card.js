'use client';

import { Copy, Eye, EyeOff, QrCode } from 'lucide-react';
import { useState } from 'react';

export function BalanceCard({
  balance = 0,
  upiId = '',
  showBalance: initialShowBalance = false,
} = {}) {
  const [showBalance, setShowBalance] = useState(initialShowBalance);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">
              Account Balance
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {showBalance
                ? `₹${balance?.toLocaleString('en-IN') || '0'}`
                : '••••••'}
            </h2>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* UPI Section */}
        <div className="space-y-3">
          <p className="text-blue-100 text-sm">UPI ID</p>

          <div className="flex items-center justify-between bg-white/15 rounded-xl p-4">
            <span className="font-mono text-sm break-all">
              {upiId || '...'}
            </span>

            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Copy UPI ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {copied && (
            <p className="text-xs text-blue-100">
              Copied to clipboard!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-xs">UPI Linked</p>
            <p className="text-white font-mono text-sm mt-1">
              {upiId ? 'Active' : 'Not Available'}
            </p>
          </div>

          <button className="p-3 rounded-lg hover:bg-white/20 transition-colors">
            <QrCode className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
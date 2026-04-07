'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TransactionCard({
  type,
  name,
  upiId,
  amount,
  timestamp,
  status,
  riskReason,
} = {}) {
  const [formattedTime, setFormattedTime] = useState('');
  const isReceived = type === 'received';

  useEffect(() => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const formatted = date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    setFormattedTime(formatted);
  }, [timestamp]);

  let statusColor = 'bg-success/20 text-success';
  let statusLabel = 'Completed';
  let statusIcon = CheckCircle2;

  if (status === 'blocked') {
    statusColor = 'bg-destructive/20 text-destructive';
    statusLabel = 'Blocked';
    statusIcon = AlertCircle;
  } else if (status === 'pending') {
    statusColor = 'bg-warning/20 text-warning';
    statusLabel = 'Pending';
    statusIcon = AlertCircle;
  }

  const StatusIcon = statusIcon;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            isReceived
              ? 'bg-success/10'
              : 'bg-primary/10'
          )}
        >
          {isReceived ? (
            <ArrowDownLeft className="w-6 h-6 text-success" />
          ) : (
            <ArrowUpRight className="w-6 h-6 text-primary" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground mt-1">{upiId}</p>
            </div>
            <p className={cn(
              'font-bold text-lg whitespace-nowrap',
              isReceived ? 'text-success' : 'text-foreground'
            )}>
              {isReceived ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Status & Time */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium', statusColor)}>
              <StatusIcon className="w-3 h-3" />
              {statusLabel}
            </div>
            <span className="text-xs text-muted-foreground">{formattedTime || '---'}</span>
          </div>

          {/* Risk Reason */}
          {riskReason && (
            <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{riskReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

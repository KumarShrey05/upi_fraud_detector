'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RiskBar({ score, reason } = {}) {
  let riskLevel = 'Low';
  let riskColor = 'bg-success';
  let textColor = 'text-success';
  let Icon = AlertCircle;

  if (score > 60) {
    riskLevel = 'High';
    riskColor = 'bg-destructive';
    textColor = 'text-destructive';
    Icon = AlertTriangle;
  } else if (score > 30) {
    riskLevel = 'Medium';
    riskColor = 'bg-warning';
    textColor = 'text-warning';
    Icon = AlertTriangle;
  }

  const percentage = Math.min(score, 100);

  return (
    <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', textColor)} />
          <span className="font-medium text-foreground">Risk Assessment</span>
        </div>
        <span className={cn('font-bold text-lg', textColor)}>
          {riskLevel} ({score}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${riskColor} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {reason && (
        <p className={cn('text-sm', textColor)}>
          <span className="font-medium">Why:</span> {reason}
        </p>
      )}
    </div>
  );
}

'use client';

import { AlertCircle, TrendingUp, Shield } from 'lucide-react';

export function InsightCard({
  type = 'info',
  title,
  description,
  metric,
} = {}) {
  let bgColor = 'bg-blue-50 border-blue-200';
  let textColor = 'text-blue-900';
  let iconColor = 'text-blue-600';
  let IconComponent = AlertCircle;

  if (type === 'warning') {
    bgColor = 'bg-destructive/10 border-destructive/20';
    textColor = 'text-destructive';
    iconColor = 'text-destructive';
    IconComponent = AlertCircle;
  } else if (type === 'success') {
    bgColor = 'bg-success/10 border-success/20';
    textColor = 'text-success';
    iconColor = 'text-success';
    IconComponent = TrendingUp;
  } else if (type === 'info') {
    bgColor = 'bg-primary/10 border-primary/20';
    textColor = 'text-primary';
    iconColor = 'text-primary';
    IconComponent = Shield;
  }

  return (
    <div className={`${bgColor} border rounded-2xl p-6`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor} mb-1`}>{title}</h3>
          <p className={`text-sm ${textColor} opacity-80 mb-2`}>
            {description}
          </p>
          {metric && (
            <p className={`text-xs font-bold ${textColor}`}>{metric}</p>
          )}
        </div>
      </div>
    </div>
  );
}
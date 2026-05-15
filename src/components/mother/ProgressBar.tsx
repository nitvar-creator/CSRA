"use client";

import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({
  current,
  total,
  label,
}: ProgressBarProps) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.max(0, Math.min(current, safeTotal));
  const percent = Math.round((clamped / safeTotal) * 100);
  const displayLabel = label ?? `Step ${clamped} of ${safeTotal}`;

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-label={displayLabel}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {displayLabel}
        </span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {percent}%
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-pink-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

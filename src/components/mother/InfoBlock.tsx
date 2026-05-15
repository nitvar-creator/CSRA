"use client";

import { Info } from "lucide-react";
import React from "react";

interface InfoBlockProps {
  title: string;
  body: string | React.ReactNode;
  icon?: React.ReactNode;
  tone?: "info" | "warning" | "success";
}

export default function InfoBlock({
  title,
  body,
  icon,
  tone = "info",
}: InfoBlockProps) {
  const toneStyles = {
    info: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      iconBg: "bg-amber-100",
    },
    warning: {
      container: "bg-rose-50 border-rose-200 text-rose-900",
      iconBg: "bg-rose-100",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      iconBg: "bg-emerald-100",
    },
  }[tone];

  return (
    <div
      role="note"
      className={`rounded-3xl border p-6 sm:p-8 flex gap-4 items-start ${toneStyles.container}`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toneStyles.iconBg}`}
      >
        {icon ?? <Info className="h-6 w-6" aria-hidden="true" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xl font-bold mb-2">{title}</div>
        <div className="text-base leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

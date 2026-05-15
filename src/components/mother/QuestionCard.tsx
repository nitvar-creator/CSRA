"use client";

import React from "react";

interface QuestionCardProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}

export default function QuestionCard({
  title,
  hint,
  children,
  required = false,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
        {title}
        {required ? <span className="text-pink-600">*</span> : null}
      </h2>
      {hint ? <p className="text-base text-slate-500 mt-2">{hint}</p> : null}
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

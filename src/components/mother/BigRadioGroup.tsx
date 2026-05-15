"use client";

import React from "react";

interface BigRadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  tone?: "positive" | "negative" | "neutral";
}

interface BigRadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: BigRadioOption[];
  required?: boolean;
  columns?: 2 | 3;
}

export default function BigRadioGroup({
  name,
  value,
  onChange,
  options,
  required = false,
  columns = 2,
}: BigRadioGroupProps) {
  const gridCols =
    columns === 3
      ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 gap-4";

  const selectedStyles = (tone: BigRadioOption["tone"]) => {
    switch (tone) {
      case "negative":
        return "border-emerald-500 bg-emerald-50";
      case "positive":
        return "border-rose-500 bg-rose-50";
      case "neutral":
      default:
        return "border-pink-500 bg-pink-50";
    }
  };

  return (
    <div role="radiogroup" aria-required={required} className={gridCols}>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const isSelected = value === opt.value;
        const tileClass = isSelected
          ? selectedStyles(opt.tone)
          : "border-slate-200 bg-white hover:bg-slate-50";

        return (
          <label
            key={id}
            htmlFor={id}
            className={`min-h-20 rounded-2xl border-2 p-5 cursor-pointer flex items-center gap-3 transition-all ${tileClass}`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              required={required}
              className="sr-only"
            />
            {opt.icon ? (
              <span className="inline-flex items-center justify-center shrink-0">
                {opt.icon}
              </span>
            ) : null}
            <span className="text-lg font-bold text-slate-900">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

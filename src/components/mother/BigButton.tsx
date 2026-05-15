"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface BigButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
}

export default function BigButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
  className = "",
}: BigButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "w-full min-h-14 py-4 px-6 text-lg font-bold rounded-2xl inline-flex items-center justify-center gap-3 transition-all duration-200";

  const variantStyles =
    variant === "primary"
      ? "bg-pink-600 text-white"
      : "bg-white text-slate-700 border border-slate-200";

  const interactive = isDisabled
    ? "opacity-60 cursor-not-allowed"
    : variant === "primary"
    ? "hover:bg-pink-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(219,39,119,0.25)]"
    : "hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={`${base} ${variantStyles} ${interactive} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      ) : (
        <>
          {icon ? <span className="inline-flex items-center">{icon}</span> : null}
          {children}
        </>
      )}
    </button>
  );
}

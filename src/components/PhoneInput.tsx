"use client";

import { forwardRef } from "react";

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { name, value, onChange, required, placeholder = "10-digit mobile number", className = "", id, ariaLabel },
  ref,
) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  return (
    <div className="flex items-stretch w-full rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-colors overflow-hidden">
      <span
        className="flex items-center px-3 text-slate-600 font-semibold border-r border-slate-200 bg-slate-100 select-none"
        aria-hidden="true"
      >
        +91
      </span>
      <input
        ref={ref}
        id={id}
        type="tel"
        name={name}
        inputMode="numeric"
        autoComplete="tel-national"
        pattern="[6-9][0-9]{9}"
        maxLength={10}
        minLength={10}
        required={required}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel ?? "Mobile number"}
        title="Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9"
        className={`flex-1 px-4 py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 ${className}`}
      />
    </div>
  );
});

export default PhoneInput;

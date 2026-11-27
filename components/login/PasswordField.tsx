"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showLabel: string;
  hideLabel: string;
  autoComplete?: string;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  onBlur?: () => void;
};

export default function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  showLabel,
  hideLabel,
  autoComplete = "new-password",
  disabled,
  invalid,
  error,
  onBlur,
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-[#1F2D33]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={invalid}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full h-14 rounded-md border bg-white px-4 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#05697F]/40 disabled:opacity-60 ${
            invalid ? "border-red-400" : "border-gray-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? hideLabel : showLabel}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  label: string;
};

// Six single-digit boxes with paste, backspace and arrow-key support.
export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  label,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigitsFrom = (index: number, input: string) => {
    const clean = input.replace(/\D/g, "");
    if (!clean) return;
    const next = value.padEnd(length, " ").split("");
    clean
      .slice(0, length - index)
      .split("")
      .forEach((d, k) => (next[index + k] = d));
    onChange(next.join("").replace(/ /g, "").slice(0, length));
    focusAt(index + clean.length);
  };

  return (
    <div role="group" aria-label={label} className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          aria-label={`${label} ${i + 1}`}
          aria-invalid={invalid}
          maxLength={length}
          onChange={(e) => setDigitsFrom(i, e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            setDigitsFrom(0, e.clipboardData.getData("text"));
          }}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (digit) onChange(value.slice(0, i) + value.slice(i + 1));
              else {
                onChange(value.slice(0, Math.max(0, i - 1)) + value.slice(i));
                focusAt(i - 1);
              }
            } else if (e.key === "ArrowLeft") focusAt(i - 1);
            else if (e.key === "ArrowRight") focusAt(i + 1);
          }}
          className={`h-12 w-10 sm:h-14 sm:w-14 rounded-md border bg-white text-center text-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#05697F]/40 disabled:opacity-60 ${
            invalid ? "border-red-400" : "border-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

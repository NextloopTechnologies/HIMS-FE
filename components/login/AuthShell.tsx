"use client";

import { LOGIN_LANGUAGES, type LoginLang } from "@/lib/loginI18n";
import LoginBackdrop from "./LoginBackdrop";
import OSpitalLogo from "./OSpitalLogo";

type Props = {
  lang: LoginLang;
  onLangChange: (lang: LoginLang) => void;
  languageLabel: string;
  children: React.ReactNode;
};

// Backdrop + language selector + frosted card, shared by the auth screens.
export default function AuthShell({ lang, onLangChange, languageLabel, children }: Props) {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 sm:px-6">
      <LoginBackdrop />
      <div className="absolute top-4 right-4 z-20">
        <label className="sr-only" htmlFor="auth-lang">
          {languageLabel}
        </label>
        <select
          id="auth-lang"
          value={lang}
          onChange={(e) => onLangChange(e.target.value as LoginLang)}
          className="rounded-md border border-white/60 bg-white/70 px-3 py-2 text-sm text-[#0B3A4A] backdrop-blur focus:outline-none focus:ring-2 focus:ring-[#05697F]/40 cursor-pointer"
        >
          {LOGIN_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <section className="relative z-10 flex w-full max-w-[664px] flex-col justify-center rounded-3xl border border-white/50 bg-white/55 px-6 py-10 shadow-xl backdrop-blur-md sm:min-h-[720px] sm:px-[100px] sm:py-14">
        <div className="mb-6">
          <OSpitalLogo />
        </div>
        {children}
      </section>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "@/components/login/AuthShell";
import OtpInput from "@/components/login/OtpInput";
import PasswordField from "@/components/login/PasswordField";
import LoadingOverlay from "@/components/LoadingOverlay";
import { requestPasswordReset, resetPassword, verifyResetOtp } from "@/services/auth";
import { LOGIN_STRINGS, type LoginLang } from "@/lib/loginI18n";
import { FORGOT_STRINGS, fillTemplate } from "@/lib/forgotI18n";

type Step = "identify" | "otp" | "password" | "success";
type OtpError = "incomplete" | "incorrect" | "expired" | "tooMany" | null;

const RESEND_SECONDS = 30;
const MAX_RESENDS = 3;
const MAX_ATTEMPTS = 5;
const REDIRECT_SECONDS = 5;
const MIN_PASSWORD_LENGTH = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const primaryButton =
  "w-full h-14 rounded-md bg-[#05697F] hover:bg-[#045a6d] text-white text-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass =
  "w-full h-14 rounded-md border bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#05697F]/40 disabled:opacity-60";

// Returns the value to send ("email" lower-cased, or a 10-digit mobile), or null if invalid.
function normalizeIdentifier(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (value.includes("@")) return EMAIL_RE.test(value) ? value.toLowerCase() : null;
  const digits = value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function maskIdentifier(id: string): string {
  if (id.includes("@")) {
    const [name, domain] = id.split("@");
    return `${name.slice(0, 1)}•••@${domain}`;
  }
  return `+91 ${id.slice(0, 5)} •••${id.slice(-2)}`;
}

const getStatus = (error): number | undefined => error?.response?.status;
const getMessage = (error): string =>
  String(error?.response?.data?.message ?? "").toLowerCase();

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [lang, setLang] = useState<LoginLang>("en");
  const t = FORGOT_STRINGS[lang];
  const [step, setStep] = useState<Step>("identify");
  const [loading, setLoading] = useState(false);

  // Step 1
  const [identifier, setIdentifier] = useState("");
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [identifierServerError, setIdentifierServerError] = useState<"unknown" | "generic" | null>(null);
  const [target, setTarget] = useState("");
  const [expiresMinutes, setExpiresMinutes] = useState(10);

  // Step 2
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<OtpError>(null);
  const [attempts, setAttempts] = useState(0);
  const [resends, setResends] = useState(0);
  const [resendLeft, setResendLeft] = useState(0);
  const [resendLimitHit, setResendLimitHit] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>();

  // Step 3
  const [password, setPassword] = useState("");
  const [resetError, setResetError] = useState(false);

  // Step 4
  const [redirectLeft, setRedirectLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("loginLang") as LoginLang | null;
      if (saved && saved in LOGIN_STRINGS) setLang(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const changeLang = (next: LoginLang) => {
    setLang(next);
    try {
      localStorage.setItem("loginLang", next);
    } catch {}
  };

  // Resend countdown
  useEffect(() => {
    if (resendLeft <= 0) return;
    const timer = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendLeft]);

  // Redirect to login after success
  useEffect(() => {
    if (step !== "success") return;
    if (redirectLeft <= 0) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => setRedirectLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, redirectLeft, router]);

  const normalized = normalizeIdentifier(identifier);
  const identifierError = !identifier.trim()
    ? t.identifierRequired
    : !normalized
      ? t.identifierInvalid
      : "";

  const sendCode = useCallback(
    async (isResend: boolean) => {
      if (!normalized) return;
      setLoading(true);
      setIdentifierServerError(null);
      try {
        const data = await requestPasswordReset(normalized);
        setTarget(data?.masked_target || maskIdentifier(normalized));
        if (data?.expires_in) setExpiresMinutes(Math.max(1, Math.round(data.expires_in / 60)));
        setResendLeft(RESEND_SECONDS);
        setOtp("");
        setOtpError(null);
        setAttempts(0);
        if (isResend) {
          setResends((n) => n + 1);
          toast.success(t.codeSentToast);
        }
        setStep("otp");
      } catch (error) {
        const status = getStatus(error);
        if (isResend && status === 429) setResendLimitHit(true);
        else if (status === 404 || getMessage(error).includes("not found") || getMessage(error).includes("not registered"))
          setIdentifierServerError("unknown");
        else if (status === 429) setIdentifierServerError("generic");
        else setIdentifierServerError("generic");
        if (isResend && status !== 429) toast.error(t.genericError);
        console.error("Password reset request failed:", error);
      } finally {
        setLoading(false);
      }
    },
    [normalized, t]
  );

  const submitIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierTouched(true);
    if (identifierError || loading) return;
    void sendCode(false);
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpError === "tooMany" || loading) return;
    if (otp.length !== 6) {
      setOtpError("incomplete");
      return;
    }
    setLoading(true);
    setOtpError(null);
    try {
      const data = await verifyResetOtp(normalized!, otp);
      setResetToken(data?.reset_token);
      setStep("password");
    } catch (error) {
      const status = getStatus(error);
      const message = getMessage(error);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (status === 410 || message.includes("expire")) setOtpError("expired");
      else if (status === 429 || status === 423 || nextAttempts >= MAX_ATTEMPTS) setOtpError("tooMany");
      else setOtpError("incorrect");
      console.error("OTP verification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const canReset = password.length >= MIN_PASSWORD_LENGTH && !loading;

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReset) return;
    setLoading(true);
    setResetError(false);
    try {
      await resetPassword({ identifier: normalized!, otp, reset_token: resetToken, password });
      setRedirectLeft(REDIRECT_SECONDS);
      setStep("success");
    } catch (error) {
      console.error("Password reset failed:", error);
      setResetError(true);
    } finally {
      setLoading(false);
    }
  };

  const otpMessage =
    otpError === "incomplete"
      ? t.otpIncomplete
      : otpError === "incorrect"
        ? t.otpIncorrect
        : otpError === "expired"
          ? t.otpExpired
          : otpError === "tooMany"
            ? t.otpTooMany
            : "";

  const backToLogin = (
    <button
      type="button"
      onClick={() => router.push("/login")}
      className="mx-auto mt-5 flex items-center gap-2 text-base text-[#1F2D33] hover:underline cursor-pointer"
    >
      <ArrowLeft size={18} /> {t.backToLogin}
    </button>
  );

  const title = "text-3xl sm:text-4xl font-bold text-[#1F2D33] text-center";
  const subtitle = "mt-3 text-base text-[#1F2D33]/90 text-center";

  return (
    <AuthShell lang={lang} onLangChange={changeLang} languageLabel={t.language}>
      {loading && <LoadingOverlay />}

      {step === "identify" && (
        <>
          <h1 className={title}>{t.resetTitle}</h1>
          <p className={subtitle}>{t.resetSubtitle}</p>
          <form className="mt-6" onSubmit={submitIdentify} noValidate>
            <label htmlFor="identifier" className="mb-2 block text-sm text-[#1F2D33]">
              {t.identifierLabel}
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder={t.identifierPlaceholder}
              value={identifier}
              disabled={loading}
              aria-invalid={(identifierTouched && !!identifierError) || !!identifierServerError}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setIdentifierServerError(null);
              }}
              onBlur={() => setIdentifierTouched(true)}
              className={`${inputClass} ${
                (identifierTouched && identifierError) || identifierServerError
                  ? "border-red-400"
                  : "border-gray-200"
              }`}
            />
            {identifierTouched && identifierError && (
              <p className="mt-1 text-xs text-red-600">{identifierError}</p>
            )}
            {identifierServerError && (
              <p role="alert" className="mt-1 flex items-start gap-1 text-xs text-red-600">
                <AlertCircle size={14} className="mt-px shrink-0" />
                {identifierServerError === "unknown" ? t.identifierUnknown : t.genericError}
              </p>
            )}
            <button
              type="submit"
              disabled={!!identifierError || loading}
              className={`${primaryButton} mt-8`}
            >
              {loading ? t.sending : t.sendOtp}
            </button>
          </form>
          {backToLogin}
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className={title}>{t.codeTitle}</h1>
          <p className={subtitle}>
            {fillTemplate(t.codeSent, { target, minutes: expiresMinutes })}
          </p>
          <form className="mt-6" onSubmit={submitOtp} noValidate>
            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                if (otpError !== "tooMany") setOtpError(null);
              }}
              disabled={loading || otpError === "tooMany"}
              invalid={!!otpError}
              autoFocus
              label={t.codeTitle}
            />
            {otpMessage && (
              <p role="alert" className="mt-3 flex items-start justify-center gap-1 text-center text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {otpMessage}
              </p>
            )}
            <p className="mt-3 text-center text-sm text-[#1F2D33]">
              {resendLimitHit || resends >= MAX_RESENDS ? (
                <span className="text-red-600">{t.resendLimit}</span>
              ) : resendLeft > 0 ? (
                <span className="text-[#1F2D33]/70">
                  {fillTemplate(t.resendIn, { seconds: resendLeft })}
                </span>
              ) : (
                <>
                  {t.didntGet}{" "}
                  <button
                    type="button"
                    onClick={() => void sendCode(true)}
                    disabled={loading}
                    className="font-semibold text-[#05697F] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {t.resendCode}
                  </button>
                </>
              )}
            </p>
            <button
              type="submit"
              disabled={otp.length !== 6 || loading || otpError === "tooMany"}
              className={`${primaryButton} mt-5`}
            >
              {loading ? t.verifying : t.verifyCode}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setStep("identify");
              setOtp("");
              setOtpError(null);
            }}
            className="mx-auto mt-5 block text-sm text-[#05697F] hover:underline cursor-pointer"
          >
            {t.changeDetails}
          </button>
          {backToLogin}
        </>
      )}

      {step === "password" && (
        <>
          <h1 className={title}>{t.newTitle}</h1>
          <p className={subtitle}>{t.newSubtitle}</p>

          {resetError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {t.resetFailed}
            </div>
          )}

          <form className="mt-6" onSubmit={submitPassword} noValidate>
            <PasswordField
              id="new-password"
              label={t.newPassword}
              placeholder={t.newPasswordPlaceholder}
              value={password}
              onChange={(v) => {
                setPassword(v);
                setResetError(false);
              }}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
              disabled={loading}
              invalid={tooShort}
              error={tooShort ? t.passwordShort : undefined}
            />

            <button type="submit" disabled={!canReset} className={`${primaryButton} mt-8`}>
              {loading ? t.resetting : t.resetPassword}
            </button>
          </form>
          {backToLogin}
        </>
      )}

      {step === "success" && (
        <div className="text-center">
          <CheckCircle2 size={56} className="mx-auto text-[#05697F]" aria-hidden="true" />
          <h1 className={`${title} mt-4`}>{t.successTitle}</h1>
          <p className={subtitle}>{t.successBody}</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={`${primaryButton} mt-8`}
          >
            {t.signIn}
          </button>
          <p className="mt-4 text-sm text-[#1F2D33]/70" aria-live="polite">
            {fillTemplate(t.redirecting, { seconds: Math.max(0, redirectLeft) })}
          </p>
        </div>
      )}
    </AuthShell>
  );
}

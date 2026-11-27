"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Info } from "lucide-react";
import { toast } from "sonner";
import { login, verifyOtp } from "@/services/auth";
import LoadingOverlay from "@/components/LoadingOverlay";
import OSpitalLogo from "@/components/login/OSpitalLogo";
import LoginBackdrop from "@/components/login/LoginBackdrop";
import {
  LOGIN_LANGUAGES,
  LOGIN_STRINGS,
  type LoginLang,
} from "@/lib/loginI18n";

type Step = "login" | "mfa" | "terms";

const TEAL = "bg-[#05697F] hover:bg-[#045a6d]";
const inputClass =
  "w-full h-14 rounded-md border bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#05697F]/40 disabled:opacity-60";
const primaryButton = `w-full h-14 rounded-md ${TEAL} text-white text-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const safeStorage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<LoginLang>("en");
  const t = LOGIN_STRINGS[lang];
  const [step, setStep] = useState<Step>("login");
  const [loginType, setLoginType] = useState<"admin" | "hospital">("admin");
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<"invalid" | "locked" | "generic" | null>(null);
  const [sessionExpired, setSessionExpired] = useState(
    searchParams.get("reason") === "expired"
  );

  const [mfa, setMfa] = useState<{ token?: string; method?: string }>({});
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<"invalid" | "wrong" | null>(null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAssigned, setAgreeAssigned] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>("");

  // Restore saved preferences (language, remembered email).
  useEffect(() => {
    const savedLang = safeStorage.get("loginLang") as LoginLang | null;
    if (savedLang && savedLang in LOGIN_STRINGS) setLang(savedLang);
    const savedEmail = safeStorage.get("rememberedEmail");
    if (savedEmail) {
      setInputs((prev) => ({ ...prev, email: savedEmail }));
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (next: LoginLang) => {
    setLang(next);
    safeStorage.set("loginLang", next);
  };

  const emailValue = inputs.email.trim();
  // Accepts a username or an email; only text that looks like an email
  // (contains "@") is checked against the email format.
  const emailError = !emailValue
    ? t.emailRequired
    : emailValue.includes("@") && !EMAIL_RE.test(emailValue)
      ? t.emailRequired
      : "";
  const passwordError = !inputs.password ? t.passwordRequired : "";
  const canSubmit = !emailError && !passwordError && !loading;

  const errorMessage = useMemo(() => {
    if (formError === "locked") return t.locked;
    if (formError === "invalid") return t.invalidCredentials;
    if (formError === "generic") return t.genericError;
    return "";
  }, [formError, t]);

  const handleChange = (name: "email" | "password", value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setSessionExpired(false);
  };

  const finishLogin = (userData) => {
    const userId = String(userData?.user?.id ?? "");
    const accepted = safeStorage.get(`termsAccepted:${userId}`);
    if (remember) safeStorage.set("rememberedEmail", inputs.email.trim());
    else safeStorage.remove("rememberedEmail");

    if (!accepted) {
      setPendingUserId(userId);
      setStep("terms");
      setLoading(false);
      return;
    }
    toast.success(t.success);
    router.push("/");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setLoading(true);
    setFormError(null);
    try {
      const userData = await login({
        email: inputs.email.trim(),
        password: inputs.password,
      });
      if (userData?.mfa_required) {
        setMfa({ token: userData.mfa_token, method: userData.mfa_method });
        setStep("mfa");
        setLoading(false);
        return;
      }
      if (userData?.access_token) {
        finishLogin(userData);
      } else {
        setFormError("generic");
        setLoading(false);
      }
    } catch (error) {
      const status = error?.response?.status;
      const message = String(error?.response?.data?.message ?? "").toLowerCase();
      if (status === 423 || status === 403 || message.includes("lock")) {
        setFormError("locked");
      } else if (status === 400 || status === 401) {
        setFormError("invalid");
      } else {
        setFormError("generic");
      }
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("invalid");
      return;
    }
    setLoading(true);
    setOtpError(null);
    try {
      const userData = await verifyOtp({ mfa_token: mfa.token, otp });
      if (userData?.access_token) finishLogin(userData);
      else {
        setOtpError("wrong");
        setLoading(false);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtpError("wrong");
      setLoading(false);
    }
  };

  const handleAgree = () => {
    if (!agreeTerms || !agreeAssigned) return;
    safeStorage.set(`termsAccepted:${pendingUserId}`, new Date().toISOString());
    // First-time login: flag the guided onboarding tour to start on the next screen.
    if (!safeStorage.get(`onboarding:${pendingUserId}`)) {
      safeStorage.set(`onboarding:${pendingUserId}`, "pending");
    }
    setLoading(true);
    toast.success(t.success);
    router.push("/");
  };

  const cardTitle =
    step === "terms" ? t.termsTitle : step === "mfa" ? t.mfaTitle : t.welcome;

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 sm:px-6">
      <LoginBackdrop />
      {loading && <LoadingOverlay />}

      {/* Language selector */}
      <div className="absolute top-4 right-4 z-20">
        <label className="sr-only" htmlFor="login-lang">
          {t.language}
        </label>
        <select
          id="login-lang"
          value={lang}
          onChange={(e) => changeLang(e.target.value as LoginLang)}
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
        {step === "login" && (
          <div className="mb-8">
            <OSpitalLogo />
          </div>
        )}

        <div className={step === "login" ? "text-center" : ""}>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2D33]">
            {cardTitle}
            {step === "login" && <span className="ml-2">👋</span>}
          </h1>
          <p className="mt-3 text-base text-[#1F2D33]/90">
            {step === "login" && t.subtitle}
            {step === "mfa" && (mfa.method === "sms" ? t.mfaSms : t.mfaApp)}
            {step === "terms" && t.termsSubtitle}
          </p>
        </div>

        {/* Step: credentials */}
        {step === "login" && (
          <>
            <div role="tablist" className="mt-6 flex justify-center gap-10 text-base">
              {(
                [
                  ["admin", t.adminLogin],
                  ["hospital", t.hospitalLogin],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={loginType === key}
                  onClick={() => setLoginType(key)}
                  className={`border-b-2 pb-1 cursor-pointer ${
                    loginType === key
                      ? "border-[#05697F] text-[#05697F]"
                      : "border-transparent text-[#1F2D33]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(sessionExpired || errorMessage) && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{errorMessage || t.expired}</span>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-[#1F2D33]">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder={t.emailPlaceholder}
                  value={inputs.email}
                  disabled={loading}
                  aria-invalid={touched.email && !!emailError}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  className={`${inputClass} ${
                    touched.email && emailError ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {touched.email && emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-[#1F2D33]">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t.passwordPlaceholder}
                    value={inputs.password}
                    disabled={loading}
                    aria-invalid={touched.password && !!passwordError}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    className={`${inputClass} pr-12 ${
                      touched.password && passwordError ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {touched.password && passwordError && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 text-base text-[#1F2D33]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 accent-[#05697F]"
                  />
                  {t.remember}
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="hover:underline cursor-pointer"
                >
                  {t.forgot}
                </button>
              </div>

              <button type="submit" disabled={!canSubmit} className={`${primaryButton} mt-2`}>
                {loading ? t.loggingIn : t.login}
              </button>
            </form>
          </>
        )}

        {/* Step: MFA */}
        {step === "mfa" && (
          <form className="mt-6 space-y-5" onSubmit={handleVerify} noValidate>
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm text-[#1F2D33]">
                {t.otpLabel}
              </label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                disabled={loading}
                autoFocus
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError(null);
                }}
                className={`${inputClass} text-center text-xl tracking-[0.5em] ${
                  otpError ? "border-red-400" : "border-gray-200"
                }`}
              />
              {otpError && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {otpError === "invalid" ? t.otpInvalid : t.otpWrong}
                </p>
              )}
            </div>
            <button type="submit" disabled={otp.length !== 6 || loading} className={primaryButton}>
              {loading ? t.verifying : t.verify}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setOtp("");
                setOtpError(null);
              }}
              className="block w-full text-center text-base text-[#05697F] hover:underline cursor-pointer"
            >
              {t.backToLogin}
            </button>
          </form>
        )}

        {/* Step: review and agree */}
        {step === "terms" && (
          <div className="mt-6 space-y-5">
            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-[#05697F]">
              <Info size={20} className="mt-0.5 shrink-0" />
              <p>{t.termsInfo}</p>
            </div>
            <label className="flex items-start gap-3 text-base text-[#1F2D33] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#05697F]"
              />
              {t.termsAgree}
            </label>
            <label className="flex items-start gap-3 text-base text-[#1F2D33] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeAssigned}
                onChange={(e) => setAgreeAssigned(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#05697F]"
              />
              {t.termsAssigned}
            </label>
            <button
              type="button"
              onClick={handleAgree}
              disabled={!agreeTerms || !agreeAssigned || loading}
              className={primaryButton}
            >
              {t.agreeContinue}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

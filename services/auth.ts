import api from "@/lib/axios";
import Cookies from "js-cookie";

// Session cookies (no expiry) so they are dropped when the browser closes.
// js-cookie can't set HttpOnly; that needs the API to set the cookie itself.
const cookieOptions = () => ({
  sameSite: "lax" as const,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

const storeSession = (resData) => {
  Cookies.set("access_token", resData?.access_token, cookieOptions()); // Store in cookie for middleware
  Cookies.set("user_role", resData?.user?.role, cookieOptions()); // UI only; middleware reads the role from the token

  localStorage.setItem("userName", resData?.user?.name);
  localStorage.setItem("userId", resData?.user?.id);
  localStorage.setItem("hospitalName", resData?.user?.hospitalName);
  localStorage.setItem("userRole", resData?.user?.role);
};

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  const resData = response.data;
  // Remote-access users get a second step; no session is stored until it passes.
  if (resData?.mfa_required) return resData;
  storeSession(resData);
  return resData;
};

// Second step for MFA users. Assumes POST /auth/verify-otp { mfa_token, otp }
// returns the same payload as /auth/login.
export const verifyOtp = async (data: { mfa_token?: string; otp: string }) => {
  const response = await api.post("/auth/verify-otp", data);
  storeSession(response.data);
  return response.data;
};

// Removes runtime caches written by the service worker so the next person on
// this device can't read the previous user's data. The precache (app shell) stays.
const clearRuntimeCaches = async () => {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => !key.startsWith("workbox-precache"))
        .map((key) => caches.delete(key))
    );
  } catch (error) {
    console.error("Failed to clear caches on logout:", error);
  }
};

export const logout = () => {
  Cookies.remove("access_token");
  Cookies.remove("user_role");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("hospitalName");
  void clearRuntimeCaches();
};

export const isLoggedIn = () => {
  return !!Cookies.get("access_token");
};

// Forgot-password flow. Assumed contract (confirm with the API):
//   POST /auth/forgot-password    { identifier }                      -> { masked_target?, expires_in? }
//   POST /auth/verify-reset-otp   { identifier, otp }                 -> { reset_token? }
//   POST /auth/reset-password     { identifier, otp, reset_token?, password }
// Errors: 404 unknown account, 410 expired code, 429 attempt/resend limit.
export const requestPasswordReset = async (identifier: string) => {
  const response = await api.post("/auth/forgot-password", { identifier });
  return response.data;
};

export const verifyResetOtp = async (identifier: string, otp: string) => {
  const response = await api.post("/auth/verify-reset-otp", { identifier, otp });
  return response.data;
};

export const resetPassword = async (data: {
  identifier: string;
  otp: string;
  reset_token?: string;
  password: string;
}) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

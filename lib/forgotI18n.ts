import type { LoginLang } from "@/lib/loginI18n";

// Placeholders in {braces} are filled by fillTemplate().
const en = {
  // Step 1
  resetTitle: "Reset your password",
  resetSubtitle:
    "Enter your registered mobile number or email. We’ll send a 6-digit code to reset your password.",
  identifierLabel: "Mobile number or email",
  identifierPlaceholder: "Enter mobile number or email",
  identifierRequired: "Enter your mobile number or email",
  identifierInvalid: "Enter a valid 10-digit mobile number or email address",
  identifierUnknown:
    "We couldn’t find an account with these details. Check them and try again.",
  sendOtp: "Send OTP",
  sending: "Sending…",
  backToLogin: "Back to log in",
  // Step 2
  codeTitle: "Enter the reset code",
  codeSent: "We sent a 6-digit code to {target}. It expires in {minutes} minutes.",
  codeSentToast: "A new code has been sent",
  didntGet: "Didn’t get it?",
  resendCode: "Resend code",
  resendIn: "Resend code in {seconds}s",
  resendLimit: "You’ve reached the resend limit. Please try again later.",
  verifyCode: "Verify Code",
  verifying: "Verifying…",
  otpIncomplete: "Enter all 6 digits",
  otpIncorrect: "That code is incorrect. Please check it and try again.",
  otpExpired: "This code has expired. Request a new one.",
  otpTooMany:
    "Too many incorrect attempts. Please wait a while before trying again.",
  changeDetails: "Use a different mobile number or email",
  // Step 3
  newTitle: "Set a new password",
  newSubtitle: "Use at least 10 characters. Pasting from a password manager is fine.",
  passwordShort: "Password must be at least 10 characters",
  newPassword: "New password",
  newPasswordPlaceholder: "Enter new password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  resetPassword: "Reset Password",
  resetting: "Resetting…",
  resetFailed: "We couldn’t reset your password. Please try again.",
  // Step 4
  successTitle: "Password reset",
  successBody:
    "Your password has been changed. You can now log in with your new password.",
  redirecting: "Taking you to log in in {seconds}s…",
  signIn: "Back to Log in",
  // Generic
  genericError: "Something went wrong. Please try again.",
  language: "Language",
};

export type ForgotStrings = typeof en;

const hi: ForgotStrings = {
  resetTitle: "अपना पासवर्ड रीसेट करें",
  resetSubtitle:
    "अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें। हम पासवर्ड रीसेट करने के लिए 6 अंकों का कोड भेजेंगे।",
  identifierLabel: "मोबाइल नंबर या ईमेल",
  identifierPlaceholder: "मोबाइल नंबर या ईमेल दर्ज करें",
  identifierRequired: "अपना मोबाइल नंबर या ईमेल दर्ज करें",
  identifierInvalid: "मान्य 10 अंकों का मोबाइल नंबर या ईमेल पता दर्ज करें",
  identifierUnknown:
    "इन विवरणों से कोई खाता नहीं मिला। कृपया जाँचें और फिर से प्रयास करें।",
  sendOtp: "OTP भेजें",
  sending: "भेजा जा रहा है…",
  backToLogin: "लॉग इन पर वापस जाएँ",
  codeTitle: "रीसेट कोड दर्ज करें",
  codeSent: "हमने {target} पर 6 अंकों का कोड भेजा है। यह {minutes} मिनट में समाप्त हो जाएगा।",
  codeSentToast: "नया कोड भेज दिया गया है",
  didntGet: "कोड नहीं मिला?",
  resendCode: "कोड दोबारा भेजें",
  resendIn: "{seconds} सेकंड में कोड दोबारा भेजें",
  resendLimit: "आप दोबारा भेजने की सीमा तक पहुँच गए हैं। कृपया बाद में प्रयास करें।",
  verifyCode: "कोड सत्यापित करें",
  verifying: "सत्यापित हो रहा है…",
  otpIncomplete: "सभी 6 अंक दर्ज करें",
  otpIncorrect: "यह कोड गलत है। कृपया जाँचकर फिर से प्रयास करें।",
  otpExpired: "यह कोड समाप्त हो चुका है। नया कोड मँगवाएँ।",
  otpTooMany: "बहुत अधिक गलत प्रयास। कृपया कुछ समय बाद फिर से प्रयास करें।",
  changeDetails: "दूसरा मोबाइल नंबर या ईमेल उपयोग करें",
  newTitle: "नया पासवर्ड सेट करें",
  newSubtitle: "कम से कम 10 अक्षर उपयोग करें। पासवर्ड मैनेजर से पेस्ट करना ठीक है।",
  passwordShort: "पासवर्ड कम से कम 10 अक्षरों का होना चाहिए",
  newPassword: "नया पासवर्ड",
  newPasswordPlaceholder: "नया पासवर्ड दर्ज करें",
  showPassword: "पासवर्ड दिखाएँ",
  hidePassword: "पासवर्ड छिपाएँ",
  resetPassword: "पासवर्ड रीसेट करें",
  resetting: "रीसेट हो रहा है…",
  resetFailed: "हम आपका पासवर्ड रीसेट नहीं कर सके। कृपया फिर से प्रयास करें।",
  successTitle: "पासवर्ड रीसेट हो गया",
  successBody: "आपका पासवर्ड बदल दिया गया है। अब आप नए पासवर्ड से लॉग इन कर सकते हैं।",
  redirecting: "{seconds} सेकंड में लॉग इन पर ले जाया जा रहा है…",
  signIn: "लॉग इन पर वापस जाएँ",
  genericError: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",
  language: "भाषा",
};

const mr: ForgotStrings = {
  resetTitle: "तुमचा पासवर्ड रीसेट करा",
  resetSubtitle:
    "तुमचा नोंदणीकृत मोबाइल नंबर किंवा ईमेल टाका. पासवर्ड रीसेट करण्यासाठी आम्ही 6 अंकी कोड पाठवू.",
  identifierLabel: "मोबाइल नंबर किंवा ईमेल",
  identifierPlaceholder: "मोबाइल नंबर किंवा ईमेल टाका",
  identifierRequired: "तुमचा मोबाइल नंबर किंवा ईमेल टाका",
  identifierInvalid: "वैध 10 अंकी मोबाइल नंबर किंवा ईमेल पत्ता टाका",
  identifierUnknown:
    "या तपशीलांसह कोणतेही खाते सापडले नाही. कृपया तपासा आणि पुन्हा प्रयत्न करा.",
  sendOtp: "OTP पाठवा",
  sending: "पाठवत आहे…",
  backToLogin: "लॉग इनकडे परत जा",
  codeTitle: "रीसेट कोड टाका",
  codeSent: "आम्ही {target} वर 6 अंकी कोड पाठवला आहे. तो {minutes} मिनिटांत कालबाह्य होईल.",
  codeSentToast: "नवीन कोड पाठवला आहे",
  didntGet: "कोड मिळाला नाही?",
  resendCode: "कोड पुन्हा पाठवा",
  resendIn: "{seconds} सेकंदात कोड पुन्हा पाठवा",
  resendLimit: "तुम्ही पुन्हा पाठवण्याची मर्यादा गाठली आहे. कृपया नंतर प्रयत्न करा.",
  verifyCode: "कोड सत्यापित करा",
  verifying: "सत्यापित होत आहे…",
  otpIncomplete: "सर्व 6 अंक टाका",
  otpIncorrect: "हा कोड चुकीचा आहे. कृपया तपासून पुन्हा प्रयत्न करा.",
  otpExpired: "हा कोड कालबाह्य झाला आहे. नवीन कोड मागवा.",
  otpTooMany: "खूप चुकीचे प्रयत्न झाले. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
  changeDetails: "दुसरा मोबाइल नंबर किंवा ईमेल वापरा",
  newTitle: "नवीन पासवर्ड सेट करा",
  newSubtitle: "किमान 10 अक्षरे वापरा. पासवर्ड मॅनेजरमधून पेस्ट करणे चालेल.",
  passwordShort: "पासवर्ड किमान 10 अक्षरांचा असावा",
  newPassword: "नवीन पासवर्ड",
  newPasswordPlaceholder: "नवीन पासवर्ड टाका",
  showPassword: "पासवर्ड दाखवा",
  hidePassword: "पासवर्ड लपवा",
  resetPassword: "पासवर्ड रीसेट करा",
  resetting: "रीसेट होत आहे…",
  resetFailed: "आम्ही तुमचा पासवर्ड रीसेट करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.",
  successTitle: "पासवर्ड रीसेट झाला",
  successBody: "तुमचा पासवर्ड बदलला आहे. आता तुम्ही नवीन पासवर्डने लॉग इन करू शकता.",
  redirecting: "{seconds} सेकंदात लॉग इनकडे नेले जात आहे…",
  signIn: "लॉग इनकडे परत जा",
  genericError: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
  language: "भाषा",
};

export const FORGOT_STRINGS: Record<LoginLang, ForgotStrings> = { en, hi, mr };

export const fillTemplate = (
  text: string,
  values: Record<string, string | number>
) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

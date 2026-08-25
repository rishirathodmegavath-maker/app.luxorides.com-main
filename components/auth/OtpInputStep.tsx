"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AuthService } from "@/services/auth.service";
import { AnimatedOtpInput, type OtpStatus } from "./AnimatedOtpInput";
import { PhoneInput } from "./LoginFlow";

/* ===============================
   TYPES
   =============================== */

type Props = {
  phone: PhoneInput;
  onVerified: () => void;
};

interface WebOtpCredential extends Credential {
  code: string;
}

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 30;

// Matches AnimatedOtpInput's own success sequence (last event fires at 1.5s + 0.4s),
// so we move to the next step right as the checkmark settles, not mid-animation.
const SUCCESS_ANIMATION_MS = 1900;
const ERROR_SHAKE_RESET_MS = 500;

export default function OtpInputStep({ phone, onVerified }: Props) {
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [resendTimer, setResendTimer] = useState(RESEND_INTERVAL);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ===============================
     DERIVED
     =============================== */

  const e164Number = useMemo(() => {
    return `${phone.countryCode}${phone.localNumber}`;
  }, [phone]);

  /* ===============================
     TIMER
     =============================== */

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setResendTimer(RESEND_INTERVAL);

    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ===============================
     WEB OTP (ANDROID CHROME)
     =============================== */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("OTPCredential" in window) ||
      !navigator.credentials
    ) {
      return;
    }

    const controller = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions)
      .then((cred) => {
        if (!cred || !("code" in cred)) return;

        const code = (cred as WebOtpCredential).code.slice(0, OTP_LENGTH);
        setOtp(code);
        setError(null);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  /* ===============================
     VERIFY OTP
     =============================== */

  const handleOtpComplete = useCallback(
    async (code: string) => {
      setError(null);
      setOtpStatus("verifying");

      try {
        const res = await AuthService.verifyOtp({
          mobileNumber: e164Number,
          otp: code,
        });

        localStorage.setItem("fleetovo_client_token", res.token);
        setOtpStatus("success");
        setTimeout(onVerified, SUCCESS_ANIMATION_MS);
      } catch {
        setError("Invalid OTP. Please try again.");
        setOtpStatus("error");
        setTimeout(() => {
          setOtp("");
          setOtpStatus("idle");
        }, ERROR_SHAKE_RESET_MS);
      }
    },
    [e164Number, onVerified]
  );

  /* ===============================
     RESEND OTP
     =============================== */

  const resendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    try {
      setResending(true);
      setError(null);

      await AuthService.generateOtp({
        mobileNumber: e164Number,
      });

      setOtp("");
      setOtpStatus("idle");
      startTimer();
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s: number) => `00:${s.toString().padStart(2, "0")}`;

  /* ===============================
     UI
     =============================== */

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={otpStatus === "success" ? "verified" : "unverified"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-sm text-white/60"
          >
            {otpStatus === "success" ? "Verified — setting up your account…" : `Sent to ${e164Number}`}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <AnimatedOtpInput length={OTP_LENGTH} value={otp} onChange={setOtp} status={otpStatus} onComplete={handleOtpComplete} />
      </div>

      {error && otpStatus === "error" && (
        <p className="text-center text-sm font-medium text-red-400">{error}</p>
      )}

      <div className="text-center text-sm">
        <button
          onClick={resendOtp}
          disabled={resendTimer > 0 || resending || otpStatus === "verifying" || otpStatus === "success"}
          className="
            text-white/70
            disabled:text-white/40
            disabled:cursor-not-allowed
            hover:underline
          "
        >
          {resendTimer > 0
            ? `Resend OTP in ${formatTime(resendTimer)}`
            : resending
            ? "Resending…"
            : "Resend OTP"}
        </button>
      </div>

      <p className="text-center text-xs text-white/45">
        Verification starts automatically after 6 digits.
      </p>
    </div>
  );
}

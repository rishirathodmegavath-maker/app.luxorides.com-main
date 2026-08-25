"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { PhoneInput } from "./LoginFlow";
import Image from "next/image";
import PolicyModal from "../policies/PolicyModal";
import { getPolicy } from "../policies/policy.service";
import { Policy } from "../policies/policy.model";

type Props = {
  onNext: (data: PhoneInput) => Promise<void>;
};

/**
 * MSG91 default-supported countries (OTP friendly)
 */
const COUNTRIES = [
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+43", label: "Austria", flag: "🇦🇹" },
  { code: "+880", label: "Bangladesh", flag: "🇧🇩" },
  { code: "+32", label: "Belgium", flag: "🇧🇪" },
  { code: "+55", label: "Brazil", flag: "🇧🇷" },
  { code: "+1", label: "Canada", flag: "🇨🇦" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+45", label: "Denmark", flag: "🇩🇰" },
  { code: "+20", label: "Egypt", flag: "🇪🇬" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+852", label: "Hong Kong", flag: "🇭🇰" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+62", label: "Indonesia", flag: "🇮🇩" },
  { code: "+353", label: "Ireland", flag: "🇮🇪" },
  { code: "+972", label: "Israel", flag: "🇮🇱" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+60", label: "Malaysia", flag: "🇲🇾" },
  { code: "+52", label: "Mexico", flag: "🇲🇽" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+64", label: "New Zealand", flag: "🇳🇿" },
  { code: "+47", label: "Norway", flag: "🇳🇴" },
  { code: "+63", label: "Philippines", flag: "🇵🇭" },
  { code: "+48", label: "Poland", flag: "🇵🇱" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+974", label: "Qatar", flag: "🇶🇦" },
  { code: "+7", label: "Russia", flag: "🇷🇺" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+27", label: "South Africa", flag: "🇿🇦" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+94", label: "Sri Lanka", flag: "🇱🇰" },
  { code: "+46", label: "Sweden", flag: "🇸🇪" },
  { code: "+41", label: "Switzerland", flag: "🇨🇭" },
  { code: "+66", label: "Thailand", flag: "🇹🇭" },
  { code: "+971", label: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", label: "United States", flag: "🇺🇸" },
];

export default function MobileInputStep({ onNext }: Props) {
  const [countryCode, setCountryCode] = useState("+91");
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const selected = COUNTRIES.find((c) => c.code === countryCode)!;

  const digitsOnly = localNumber.replace(/\D/g, "");

  const isValid = agreed && /^\d{6,14}$/.test(digitsOnly); // UI-level validation only

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proceed = async () => {
    // Guards against duplicate/concurrent "Send OTP" taps -- without this, a
    // double-tap fires two generate-otp requests for the same phone number,
    // which can deadlock the backend's OTP write and crash this step.
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onNext({
        countryCode,
        localNumber: digitsOnly,
      });
    } catch {
      setError("Couldn't send OTP. Please try again.");
      setSubmitting(false);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);

  const openPolicy = (type: "PRIVACY" | "TERMS") => {
    const policy = getPolicy(type);
    if (!policy) return;

    setActivePolicy(policy);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo/luxorides-shield-white.png"
            alt="Luxorides"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Login with Mobile
          </h2>
          <p className="text-sm text-white/60">
            We’ll send a one-time password
          </p>
        </div>

        {/* Country Picker */}
        <div className="relative">
          <label className="text-xs text-white/60">Country</label>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="
            mt-1 w-full h-12 px-4
            lux-control
            rounded-xl
            flex items-center justify-between
          "
          >
            <span className="flex items-center gap-2">
              <span>{selected.flag}</span>
              <span>{selected.label}</span>
              <span className="text-white/60">({selected.code})</span>
            </span>
            <span className="text-white/60">▾</span>
          </button>

          {open && (
            <div
              className="
              absolute z-20 mt-2 w-full
              lux-panel rounded-xl
              shadow-xl overflow-y-auto max-h-64
            "
            >
              {COUNTRIES.map((c) => (
                <button
                  key={`${c.label}-${c.code}`}
                  onClick={() => {
                    setCountryCode(c.code);
                    setOpen(false);
                  }}
                  className="
                  w-full px-4 py-3 text-left
                  text-white hover:bg-white/10
                  flex items-center gap-2
                "
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                  <span className="text-white/60">({c.code})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-xs text-white/60">Mobile Number</label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Enter mobile number"
            value={localNumber}
            onChange={(e) => setLocalNumber(e.target.value)}
            className="
            mt-1 w-full h-12 px-4
            lux-input-dark rounded-xl
            placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          />
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer">
          {/* Custom checkbox */}
          <button
            type="button"
            aria-pressed={agreed}
            onClick={() => setAgreed((v) => !v)}
            className={`
  mt-1 h-5 w-5 min-w-[20px] min-h-[20px]
  flex-shrink-0
  rounded
  flex items-center justify-center
  border transition
  ${
    agreed
      ? "bg-white text-black border-white"
      : "bg-transparent border-white/40"
  }
`}
          >
            {agreed && (
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* Text */}
          <span>
            I agree to the{" "}
            <button
              type="button"
              onClick={() => openPolicy("PRIVACY")}
              className="underline hover:text-white"
            >
              Privacy Policy
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => openPolicy("TERMS")}
              className="underline hover:text-white"
            >
              Terms of Service
            </button>
            .
          </span>
        </label>

        {/* CTA */}
        {error && (
          <p className="text-center text-sm font-medium text-red-400">{error}</p>
        )}
        <Button
          variant="glass"
          className="w-full"
          onClick={proceed}
          disabled={!isValid || submitting}
        >
          {submitting ? "SENDING…" : "SEND OTP"}
        </Button>
      </div>
      <PolicyModal
        open={modalOpen}
        policy={activePolicy}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

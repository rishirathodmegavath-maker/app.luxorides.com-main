"use client";

import { Passenger } from "@/types";
import { useMemo, useState } from "react";

/* =====================================================
   CONSTANTS
   ===================================================== */

const SALUTATIONS = ["Mr.", "Ms.", "Mrs.", "Dr."] as const;

const COUNTRIES =  [
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

/* =====================================================
   HELPERS
   ===================================================== */

const normalizePhone = (countryCode: string, raw: string) => {
  let digits = raw.replace(/\D/g, "");

  // remove leading 0 (common in India numbers like 08840...)
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  // remove country code if user pasted full number
  const cc = countryCode.replace("+", "");
  if (digits.startsWith(cc)) {
    digits = digits.slice(cc.length);
  }

  return `${countryCode}${digits}`;
};

/* =====================================================
   COMPONENT
   ===================================================== */

export default function PassengerForm({
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: {
  initialValues?: Passenger;
  submitLabel?: string;
  onSubmit: (values: Passenger) => void;
  onCancel?: () => void;
}) {
  /* ================= PHONE SPLIT ================= */

  const splitPhone = (phone?: string) => {
    if (!phone) return { code: "+91", number: "" };

    const match = phone.match(/^(\+\d{1,3})(\d+)$/);
    if (!match) return { code: "+91", number: phone };

    return { code: match[1], number: match[2] };
  };

  const phoneParts = splitPhone(initialValues?.phone);

  /* ================= STATE ================= */

  const [salutation, setSalutation] = useState(
    initialValues?.name.salutation ?? ""
  );
  const [firstName, setFirstName] = useState(
    initialValues?.name.firstName ?? ""
  );
  const [lastName, setLastName] = useState(
    initialValues?.name.lastName ?? ""
  );

  const [countryCode, setCountryCode] = useState(phoneParts.code);
  const [mobile, setMobile] = useState(phoneParts.number);
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState(initialValues?.email ?? "");

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0],
    [countryCode]
  );

  /* ================= SUBMIT ================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPhone = normalizePhone(countryCode, mobile);

    onSubmit({
      id: initialValues?.id || "",
      name: {
        salutation,
        firstName,
        lastName: lastName || undefined,
      },
      phone: normalizedPhone,
      email: email || undefined,
    });
  };

  /* ================= RENDER ================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* ================= SALUTATION ================= */}
      <div>
        <label className="text-sm text-white/70">Title</label>

        <div className="mt-1 flex gap-2 flex-wrap">
          {SALUTATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSalutation(s)}
              className={`px-4 py-2 rounded-xl text-sm border transition ${
                salutation === s
                  ? "bg-white border-white text-black"
                  : "lux-control text-white/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ================= NAME ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className="text-sm text-white/70">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="First name"
            className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
          />
        </div>

        <div className="min-w-0">
          <label className="text-sm text-white/70">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
          />
        </div>
      </div>

      {/* ================= PHONE ================= */}
      <div className="relative">
        <label className="text-sm text-white/70">Mobile Number</label>

        <div className="lux-input-dark mt-1 flex items-center w-full px-3 py-2 rounded-xl">
          {/* Country */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 shrink-0 pr-2 border-r border-white/20"
          >
            <span>{selected.flag}</span>
            <span className="text-sm">{selected.code}</span>
          </button>

          {/* Input */}
          <input
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, ""))
            }
            required
            inputMode="tel"
            placeholder="Mobile number"
            className="flex-1 min-w-0 px-3 bg-transparent text-white placeholder:text-white/40 outline-none"
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="lux-panel absolute z-20 mt-2 w-full rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCountryCode(c.code);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 flex items-center gap-3"
              >
                <span>{c.flag}</span>
                <span className="flex-1">{c.label}</span>
                <span className="text-white/60">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= EMAIL ================= */}
      <div>
        <label className="text-sm text-white/70">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
        />
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition"
        >
          {submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="lux-control flex-1 py-2 rounded-xl text-white/80 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

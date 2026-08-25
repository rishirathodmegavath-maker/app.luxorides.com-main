"use client";

import { getWhatsAppLink } from "@/lib/whatsapp";
import { callPhoneNumber, openExternalUrl } from "@/lib/external-navigation";
import { ArrowUpRight, Phone } from "lucide-react";

export default function ConciergeCTA() {
  const whatsappMessage = `
Hi,

I am exploring vehicles on the App and would appreciate Luxorides’ assistance for my journey.
  `.trim();

  return (
    <section className="w-full px-4 pb-6">
      <div
        className="
          lux-card relative mx-auto max-w-xl overflow-hidden
          rounded-[28px] p-5 sm:p-6
        "
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#d8b25c]/12 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b25c]">
            Reservations concierge
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            Need assistance?
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/66">
            Our reservations specialists will help you select the ideal vehicle
            and journey plan.
          </p>
        </div>

        <div className="relative mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => openExternalUrl(getWhatsAppLink(whatsappMessage))}
            className="
              flex min-h-12 w-full items-center justify-between gap-3
              rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white
              transition-all duration-200 hover:bg-[#20bd5a] active:scale-[0.985]
            "
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18">
                <WhatsAppIcon />
              </span>
              Chat with Concierge
            </span>
            <ArrowUpRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => callPhoneNumber("+919506090609")}
            className="
              lux-control flex min-h-12 w-full items-center justify-between gap-3
              rounded-2xl px-4 py-3 text-sm font-semibold text-white
              transition-all duration-200 hover:bg-white/10 active:scale-[0.985]
            "
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8b25c]/14 text-[#f2d384]">
                <Phone size={16} />
              </span>
              Call Reservations
            </span>
            <span className="text-xs font-medium text-white/45">
              +91 95060 90609
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-[19px] w-[19px] fill-current"
    >
      <path d="M16.04 3.2A12.7 12.7 0 0 0 5.27 22.63L3.2 28.8l6.35-2.04A12.8 12.8 0 1 0 16.04 3.2Zm0 23.42a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.76 1.2 1.23-3.65-.25-.4a10.58 10.58 0 1 1 8.57 4.56Zm5.82-7.93c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.51-.16-.73.16-.21.32-.83 1.04-1.02 1.25-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59a9.65 9.65 0 0 1-1.78-2.21c-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.72-.55h-.62c-.21 0-.56.08-.86.4-.29.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.31.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.46.21 2.01.13.62-.09 1.9-.78 2.16-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";

import { useView } from "./ViewContext";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I change the pickup time or location for a booking?",
    answer:
      "Open the booking from Trips → Booking details. If the duty hasn't started yet, contact our reservations concierge (via WhatsApp or phone from the Home screen) with the change you need — our team will update the reporting time or location and reflect it on your booking.",
  },
  {
    question: "Can I cancel a confirmed booking?",
    answer:
      "Yes. On the booking's detail screen, use \"Cancel booking\" for bookings that are Confirmed or already Running. You'll see the exact refund breakdown — including any cancellation fee — before you confirm, based on how close you are to the reporting time.",
  },
  {
    question: "How long does a refund take after I cancel?",
    answer:
      "Cancelling submits a refund request for admin review — it isn't instant. Once approved, the refund is credited back to your original payment method; timelines depend on your bank/payment provider, typically 5-7 business days.",
  },
  {
    question: "How do I know when my driver is on the way?",
    answer:
      "Once a duty is marked Running, the booking details screen shows a live map with your driver's position, along with distance remaining and an estimated arrival time when available.",
  },
  {
    question: "Can I share my live trip location with someone else?",
    answer:
      "Yes. While a duty is Running, tap \"Share trip\" on the booking details screen to generate a link. Anyone with the link can follow your driver's live location and ETA without needing to log in — no account required.",
  },
  {
    question: "How do I pay for a booking?",
    answer:
      "Any pending balance on a booking is shown on the booking summary card with a \"Pay Now\" button, which takes you through our secure payment flow. You can also see all past payments recorded against the booking there.",
  },
  {
    question: "Where can I find my invoice?",
    answer:
      "Once a booking is billed, an \"Invoice\" button appears at the top of the booking details screen — tap it to download the PDF invoice.",
  },
  {
    question: "How do I rate my driver or leave feedback on a trip?",
    answer:
      "After a duty is marked Completed, a \"Rate this trip\" prompt appears on that duty's card in the booking details screen. Pick a star rating and, optionally, add a comment — you can only rate a completed trip once.",
  },
  {
    question: "What should I do if I feel unsafe during a trip, or have an urgent issue?",
    answer:
      "Call our reservations line directly from the Home screen concierge card — it's staffed for urgent, trip-in-progress issues. For anything non-urgent, raise a support ticket from Account → Support and our team will follow up.",
  },
  {
    question: "How do I contact support for a non-urgent question?",
    answer:
      "Go to Account → Support and start a new ticket describing your question. You'll get a reply in the same conversation thread, and can keep messaging back and forth until it's resolved.",
  },
];

export default function FaqView() {
  const { setView } = useView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView({ name: "account" })}
          className="lux-control p-2 rounded-full transition"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="lux-card overflow-hidden rounded-2xl">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <span className="text-sm font-medium text-white">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-white/45 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm leading-6 text-white/68">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

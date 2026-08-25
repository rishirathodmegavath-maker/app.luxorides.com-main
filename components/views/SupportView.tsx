"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";

import { useView } from "./ViewContext";
import { SupportService } from "@/services/support.service";
import { SupportTicketResponse, SupportTicketStatus } from "@/types";
import { instantToReadable } from "@/lib/date";
import LoadingState from "../ui/LoadingState";

export default function SupportView() {
  const { setView } = useView();
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = () => {
    setLoading(true);
    SupportService.listTickets()
      .then(setTickets)
      .catch(() => {
        // Best-effort -- leave the last known list on screen.
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const ticket = await SupportService.createTicket(subject.trim(), message.trim());
      setTickets((prev) => [ticket, ...prev]);
      setShowNewTicket(false);
      setSubject("");
      setMessage("");
      setView({ name: "support-thread", ticketId: ticket.id });
    } catch {
      setError("Couldn't submit your ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView({ name: "account" })}
            className="lux-control p-2 rounded-full transition"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">Support</h2>
        </div>

        <button
          onClick={() => setShowNewTicket((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/85"
        >
          <Plus size={16} />
          New ticket
        </button>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        {showNewTicket && (
          <div className="lux-card rounded-[24px] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">New support ticket</h3>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="lux-input-dark w-full rounded-xl px-4 py-2.5 text-sm"
            />

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's going on…"
              className="lux-input-dark w-full rounded-xl px-4 py-2.5 text-sm"
            />

            {error && <p className="text-xs text-rose-300">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewTicket(false)}
                className="lux-control rounded-xl px-4 py-2 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!subject.trim() || !message.trim() || submitting}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingState label="Loading tickets" className="min-h-[200px]" />
        ) : tickets.length === 0 ? (
          <div className="lux-card rounded-[24px] px-6 py-12 text-center">
            <MessageCircle size={22} className="mx-auto mb-3 text-white/35" />
            <p className="text-white/60">No support tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setView({ name: "support-thread", ticketId: ticket.id })}
                className="w-full text-left lux-card rounded-2xl p-4 transition hover:bg-[#202024]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {instantToReadable(ticket.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SupportStatusPill status={ticket.status} />
                    <ChevronRight size={16} className="text-white/40" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

function SupportStatusPill({ status }: { status: SupportTicketStatus }) {
  const variants: Record<SupportTicketStatus, string> = {
    [SupportTicketStatus.OPEN]: "bg-amber-500/18 text-amber-300",
    [SupportTicketStatus.IN_PROGRESS]: "bg-blue-500/18 text-blue-300",
    [SupportTicketStatus.CLOSED]: "bg-white/10 text-white/55",
  };

  const labels: Record<SupportTicketStatus, string> = {
    [SupportTicketStatus.OPEN]: "Open",
    [SupportTicketStatus.IN_PROGRESS]: "In progress",
    [SupportTicketStatus.CLOSED]: "Closed",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${variants[status]}`}
    >
      {labels[status]}
    </span>
  );
}

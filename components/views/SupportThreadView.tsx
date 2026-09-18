"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";

import { useView } from "./ViewContext";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { SupportTicketStatus } from "@/types";
import { instantToReadable } from "@/lib/date";
import LoadingState from "../ui/LoadingState";

export default function SupportThreadView({ ticketId }: { ticketId: string }) {
  const { setView } = useView();

  // P1.3 -- reads the target ticket out of the shared SupportTicketsProvider
  // list instead of this screen's own GET /client/app/support/tickets fetch.
  // If the client just came from SupportView (the normal navigation path),
  // the ticket -- messages included -- is already in `tickets`, so this
  // renders immediately with no loading flash. refresh() below still runs
  // once on open for freshness (an agent may have replied since the list
  // was loaded); there's no backend GET-by-id endpoint to make that check
  // cheaper than a full-list refetch (see the P1.3 report).
  const { tickets, loading, refresh, sendMessage } = useSupportTickets();
  const ticket = tickets.find((t) => t.id === ticketId) ?? null;

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  const handleSend = async () => {
    if (!reply.trim()) return;

    try {
      setSending(true);
      await sendMessage(ticketId, reply.trim());
      setReply("");
    } catch {
      // Best-effort -- leave the draft in the box so the client can retry.
    } finally {
      setSending(false);
    }
  };

  if (!ticket && loading) {
    return (
      <section className="app-screen">
        <LoadingState label="Loading conversation" className="min-h-[320px]" />
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="app-screen">
        <div className="lux-card rounded-[28px] px-6 py-12 text-center">
          <p className="text-white/60">Ticket not found.</p>
          <button
            onClick={() => setView({ name: "support" })}
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Back to support
          </button>
        </div>
      </section>
    );
  }

  const isClosed = ticket.status === SupportTicketStatus.CLOSED;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView({ name: "support" })}
          className="lux-control p-2 rounded-full transition"
          aria-label="Back to support"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{ticket.subject}</h2>
          <p className="text-xs text-white/45">
            {instantToReadable(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="lux-card space-y-3 rounded-[24px] p-4">
          {ticket.messages.map((msg) => {
            const isClient = msg.senderType === "CLIENT";
            return (
              <div
                key={msg.id}
                className={`flex ${isClient ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isClient
                      ? "bg-white text-black"
                      : "border border-white/10 bg-[#101114] text-white/85"
                  }`}
                >
                  <p>{msg.message}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isClient ? "text-black/45" : "text-white/40"
                    }`}
                  >
                    {instantToReadable(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex items-end gap-3">
          <textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={isClosed ? "This ticket is closed." : "Type a reply…"}
            disabled={isClosed}
            className="lux-input-dark flex-1 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isClosed || !reply.trim() || sending}
            className="lux-control flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send reply"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

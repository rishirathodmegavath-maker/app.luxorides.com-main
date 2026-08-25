"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Car,
  Layers3,
  MapPin,
  Route,
} from "lucide-react";

import { BookingListEntry, BookingStatus } from "@/types";
import { ClientBookingService } from "@/services/client-booking.service";
import { useView } from "@/components/views/ViewContext";
import { instantToReadable } from "@/lib/date";
import { BookingStatusBadge } from "../booking/BookingStatusBadge";
import LoadingState from "../ui/LoadingState";

type TabType = "upcoming" | "recent";

export default function BookingView() {
  const { setView } = useView();

  const [bookings, setBookings] = useState<BookingListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  useEffect(() => {
    ClientBookingService.list()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  /* ================= GROUPING ================= */

  const { upcoming, recent } = useMemo(() => {
    const upcomingStatuses = [
      BookingStatus.DRAFT,
      BookingStatus.CONFIRMED,
      BookingStatus.RUNNING,
    ];

    const recentStatuses = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.BILLED,
    ];

    return {
      upcoming: bookings.filter((b) => upcomingStatuses.includes(b.status)),
      recent: bookings.filter((b) => recentStatuses.includes(b.status)),
    };
  }, [bookings]);

  const visibleBookings = activeTab === "upcoming" ? upcoming : recent;

  return (
    <section className="app-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b25c]">
            Trips
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reservations
          </h1>
          <p className="text-sm lg:text-base text-white/65">
            Manage your upcoming and completed journeys
          </p>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex justify-center">
          <div className="lux-panel grid w-full max-w-sm grid-cols-2 rounded-full p-1">
            <TabButton
              active={activeTab === "upcoming"}
              onClick={() => setActiveTab("upcoming")}
              label={`Upcoming (${upcoming.length})`}
            />
            <TabButton
              active={activeTab === "recent"}
              onClick={() => setActiveTab("recent")}
              label={`Past Journeys (${recent.length})`}
            />
          </div>
        </div>

        {loading && (
          <LoadingState label="Loading your bookings" className="min-h-[260px]" />
        )}

        {/* Empty */}
        {!loading && visibleBookings.length === 0 && (
          <div className="lux-card rounded-[28px] py-12 text-center text-white/70">
            No {activeTab} bookings found.
          </div>
        )}

        {/* Grid */}
        {!loading && visibleBookings.length > 0 && (
          <div
            className="
              grid grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
              gap-4 lg:gap-6
            "
          >
            {visibleBookings.map((b) => (
              <BookingCard
                key={b.bookingId}
                booking={b}
                onOpen={() =>
                  setView({
                    name: "booking-detail",
                    bookingId: b.bookingId,
                  })
                }
              />
            ))}
          </div>
        )}
    </section>
  );
}

/* =====================================================
   TAB BUTTON
   ===================================================== */

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2.5 text-sm rounded-full transition
        ${
          active
            ? "bg-white text-black font-medium"
            : "text-white/70 hover:bg-white/10"
        }
      `}
    >
      {label}
    </button>
  );
}

/* =====================================================
   CARD
   ===================================================== */

function BookingCard({
  booking,
  onOpen,
}: {
  booking: BookingListEntry;
  onOpen: () => void;
}) {
  const isMultiDuty = booking.duties > 1;

  return (
    <motion.button
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onOpen}
      aria-label={`View booking ${booking.bookingId}`}
      className="group w-full cursor-pointer text-left"
    >
      <article className="lux-card relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-[28px] border border-white/8 p-5 transition-colors group-hover:border-white/16">
        <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#d8b25c]/10 blur-3xl transition-opacity group-hover:opacity-100" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b25c]">
              Booking #{booking.bookingId}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
              {isMultiDuty
                ? `${booking.duties}-duty itinerary`
                : booking.vehicle || "Vehicle requested"}
            </h3>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:rotate-6">
            <ArrowUpRight size={17} />
          </span>
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-3">
          <BookingStatusBadge status={booking.status} />
          <span className="flex items-center gap-1.5 text-xs text-white/48">
            {isMultiDuty ? <Layers3 size={13} /> : <Car size={13} />}
            {booking.duties} duty{booking.duties === 1 ? "" : "ies"}
          </span>
        </div>

        {/* Booking overview */}
        <div className="relative mt-5 flex-1 rounded-[22px] border border-white/8 bg-[#101114] p-4">
          {isMultiDuty && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-wide text-white/38">
                Duty sequence
              </p>
              <div className="mt-3 flex items-center">
                {Array.from({ length: Math.min(booking.duties, 4) }).map(
                  (_, index) => (
                    <div key={index} className="flex flex-1 items-center">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d8b25c]/30 bg-[#d8b25c]/12 text-[10px] font-semibold text-[#f2d384]">
                        {index + 1}
                      </span>
                      {index < Math.min(booking.duties, 4) - 1 && (
                        <span className="h-px flex-1 bg-linear-to-r from-[#d8b25c]/35 to-white/10" />
                      )}
                    </div>
                  ),
                )}
                {booking.duties > 4 && (
                  <span className="ml-2 text-xs font-medium text-white/48">
                    +{booking.duties - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8b25c]/12 text-[#f2d384]">
              <MapPin size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-white/38">
                {isMultiDuty ? "Journey starts" : "Pickup"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-white/86">
                {booking.location || "Location pending"}
              </p>
            </div>
          </div>

          <div className="my-3 ml-4 h-4 border-l border-dashed border-[#d8b25c]/35" />

          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/7 text-white/60">
              <CalendarDays size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-white/38">
                {isMultiDuty ? "Booking window" : "Schedule"}
              </p>
              <p className="mt-1 text-sm text-white/78">
                {isMultiDuty ? "Starts " : ""}
                {instantToReadable(booking.from)}
              </p>
              {booking.till && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/45">
                  <Route size={12} />
                  {isMultiDuty ? "Ends" : "Until"}{" "}
                  {instantToReadable(booking.till)}
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="relative mt-4 flex items-center justify-between text-xs">
          <span className="text-white/42">Tap to view trip details</span>
          <span className="font-medium text-[#f2d384] transition-transform group-hover:translate-x-1">
            View booking
          </span>
        </div>
      </article>
    </motion.button>
  );
}

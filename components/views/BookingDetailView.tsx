// components/views/BookingDetailView.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  BadgeIndianRupee,
  Car,
  ChevronLeft,
  Download,
  Link2,
  MapPin,
  Plane,
  ReceiptText,
  Route,
  Sparkles,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";

import { useView } from "./ViewContext";
import { useBookingRealtime } from "@/hooks/useBookingRealtime";
import { ClientBookingService } from "@/services/client-booking.service";
import {
  ClientBookingDTO,
  BookingStatus,
  CancelPreviewResponse,
  ClientBookingEntry,
  DutyRatingResponse,
  DutyStatus,
} from "@/types";
import { BookingSummaryCard } from "../booking/BookingSummaryCard";
import { LiveDriverMap } from "../duty/LiveDriverMap";
import LoadingState from "../ui/LoadingState";
import ConfirmDialog from "../ui/ConfirmDialog";
import {
  displayDutyStatus,
  displayMoney,
  displayPackageSummary,
} from "@/lib/utils";
import { instantToReadable } from "@/lib/date";
import { getFileUrl } from "@/utils/file-url";
import { openBlobFile, shareTripLink } from "@/lib/external-navigation";

export default function BookingDetailView({
  bookingId,
}: {
  bookingId: string;
}) {
  const { setView } = useView();

  const [booking, setBooking] = useState<ClientBookingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // ================= CANCEL + REFUND =================
  const [cancelPreview, setCancelPreview] = useState<CancelPreviewResponse | null>(null);
  const [loadingCancelPreview, setLoadingCancelPreview] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const taxableAmount = booking?.entries.reduce(
    (sum, e) => sum + e.dutyTotal.amount,
    0
  );

  const totalAmount = booking?.total.amount ?? 0;

  const paidAmount = booking?.payments.reduce(
    (sum, p) => sum + p.paymentAmount.amount,
    0
  ) ?? 0;

  const pendingAmount = Math.max(totalAmount - paidAmount, 0);

  useEffect(() => {
    ClientBookingService.get(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false));
  }, [bookingId]);

  const bookingStatus = booking?.status;

  // Fleetovo is the source of truth for booking/duty status — the driver
  // app drives real transitions (RUNNING when a duty starts, COMPLETED when
  // it ends) independently of this tab, so this view needs to learn about
  // them rather than only fetching once on load. A WebSocket push (see
  // useBookingRealtime) replaces the old 12s poll; this only decides
  // whether the socket should be open at all, since nothing changes once
  // the booking has reached a terminal status.
  const isTerminalStatus =
    !bookingStatus ||
    bookingStatus === BookingStatus.COMPLETED ||
    bookingStatus === BookingStatus.CANCELLED ||
    bookingStatus === BookingStatus.BILLED;

  useBookingRealtime(bookingId, !isTerminalStatus, () => {
    ClientBookingService.get(bookingId)
      .then(setBooking)
      .catch(() => {
        // Best-effort refresh — leave the last known booking state on screen
        // rather than clearing it on a transient network/API error.
      });
  });

  const handleDownloadInvoice = async () => {
    if (!booking?.invoiceNumber) return;

    try {
      setDownloadingInvoice(true);

      const blob = await ClientBookingService.downloadInvoicePdf(
        booking.invoiceNumber
      );

      await openBlobFile(blob, `${booking.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("Invoice download failed", err);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const canCancelBooking =
    bookingStatus === BookingStatus.CONFIRMED ||
    bookingStatus === BookingStatus.RUNNING;

  const handleOpenCancelPreview = async () => {
    if (!booking) return;

    try {
      setLoadingCancelPreview(true);
      const preview = await ClientBookingService.getCancelPreview(booking.bookingId);
      setCancelPreview(preview);
    } catch (err) {
      console.error("Failed to load cancellation preview", err);
      toast.error("Couldn't load cancellation details. Please try again.");
    } finally {
      setLoadingCancelPreview(false);
    }
  };

  const handleCloseCancelDialog = () => {
    setCancelPreview(null);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!booking || !cancelReason.trim()) return;

    try {
      setCancelling(true);
      await ClientBookingService.cancelBooking(booking.bookingId, cancelReason.trim());
      handleCloseCancelDialog();
      toast.success("Cancellation submitted — refund pending admin review.");
      const refreshed = await ClientBookingService.get(bookingId);
      setBooking(refreshed);
    } catch (err) {
      console.error("Cancellation failed", err);
      toast.error("Couldn't cancel the booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <section className="app-screen">
        <LoadingState label="Loading booking details" className="min-h-[320px]" />
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="app-screen">
        <div className="lux-card rounded-[28px] px-6 py-12 text-center">
          <p className="text-white/60">Booking not found.</p>
          <button
            onClick={() => setView({ name: "booking" })}
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Back to bookings
          </button>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-7"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView({ name: "booking" })}
            className="lux-control rounded-full p-2 transition"
            aria-label="Back to bookings"
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#d8b25c]">
              Your trip
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Booking details
            </h1>
            <p className="mt-1 text-xs text-white/48">
              {instantToReadable(booking.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ================= CANCEL BOOKING ================= */}
          {canCancelBooking && (
            <button
              onClick={handleOpenCancelPreview}
              disabled={loadingCancelPreview}
              className="
                inline-flex items-center gap-2
                px-3 py-2
                rounded-xl
                lux-control
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
                hover:border-rose-400/40
              "
            >
              <XCircle size={16} />
              <span className="text-sm">
                {loadingCancelPreview ? "Loading…" : "Cancel booking"}
              </span>
            </button>
          )}

          {/* ================= DOWNLOAD INVOICE ================= */}
          {booking.status === BookingStatus.BILLED && booking.invoiceNumber && (
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="
                inline-flex items-center gap-2
                px-3 py-2
                rounded-xl
                lux-control
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              <Download size={16} />
              <span className="text-sm">
                {downloadingInvoice ? "Downloading…" : "Invoice"}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ================= DUTIES ================= */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8b25c]">
                Itinerary
              </p>
              <h2 className="mt-1 text-lg font-semibold">Trip details</h2>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/55">
              {booking.entries.length} duty
              {booking.entries.length === 1 ? "" : "ies"}
            </span>
          </div>

          {booking.entries.map((entry, index) => (
            <DutyDetailCard key={entry.dutyId} entry={entry} index={index} />
          ))}
        </div>

        {/* ================= BOOKING SUMMARY ================= */}
        <aside className="xl:sticky xl:top-24">
          <BookingSummaryCard
            booking={booking}
            taxableAmount={taxableAmount!}
            pendingAmount={pendingAmount}
            onPay={() => {
              setView({ name: "payment", bookingId: booking.bookingId });
            }}
          />
        </aside>
      </div>

      {/* ================= CANCEL CONFIRMATION ================= */}
      <ConfirmDialog
        open={!!cancelPreview}
        title="Cancel this booking?"
        description={
          cancelPreview
            ? cancelPreview.withinFreeWindow
              ? `You're within the free-cancellation window — full refund of ${displayMoney(
                  { amount: cancelPreview.refundAmount, currency: booking.total.currency }
                )}.`
              : `You'll be refunded ${displayMoney({
                  amount: cancelPreview.refundAmount,
                  currency: booking.total.currency,
                })} of ${displayMoney({
                  amount: cancelPreview.paidAmount,
                  currency: booking.total.currency,
                })} paid. A cancellation fee of ${displayMoney({
                  amount: cancelPreview.feeAmount,
                  currency: booking.total.currency,
                })} applies.`
            : undefined
        }
        confirmText={cancelling ? "Cancelling…" : "Confirm cancellation"}
        cancelText="Keep booking"
        danger
        confirmDisabled={!cancelReason.trim() || cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelDialog}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">
            Reason for cancellation
          </label>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Let us know why you're cancelling…"
            className="lux-input-dark w-full rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </ConfirmDialog>
    </motion.section>
  );
}

function DutyDetailCard({
  entry,
  index,
}: {
  entry: ClientBookingEntry;
  index: number;
}) {
  return (
    <article className="lux-card overflow-hidden rounded-[28px]">
      <div className="bg-[#f5f1e8] p-4 text-black">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-28 shrink-0 rounded-2xl bg-white">
            <Image
              src={getFileUrl(entry.vehiclePic) || "/placeholder-car-png.webp"}
              alt={entry.vehicleName ?? "Vehicle"}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
                Duty {index + 1}
              </span>
              <DutyStatusPill status={entry.status} />
            </div>
            <h4 className="truncate text-base font-semibold">
              {entry.vehicleName ?? "Vehicle requested"}
            </h4>
            <p className="truncate text-sm text-black/58">
              {[entry.brand, entry.category].filter(Boolean).join(" / ") ||
                "Allocation pending"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl border border-[#d8b25c]/20 bg-[#d8b25c]/8 p-4">
          <div className="mb-3 flex items-center gap-2 text-[#f2d384]">
            <Route size={16} />
            <p className="text-[11px] font-semibold uppercase tracking-wide">
              Route
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
            <RoutePoint
              label="Pickup"
              location={entry.reportingLocation}
              time={entry.reportingTime}
            />
            <div className="hidden pt-5 text-[#d8b25c]/55 sm:block">→</div>
            <RoutePoint
              label="Drop"
              location={entry.dropLocation || "To be confirmed"}
              time={entry.dropTime}
            />
          </div>
        </div>

        {entry.status === DutyStatus.RUNNING ? (
          <>
            <LiveDriverMap dutyId={entry.dutyId} />
            <ShareTripButton dutyId={entry.dutyId} />
          </>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={<Sparkles size={16} />}
            label="Package"
            value={displayPackageSummary(entry.packageSnapshot)}
          />
          <DetailItem
            icon={<BadgeIndianRupee size={16} />}
            label="Duty total"
            value={displayMoney(entry.dutyTotal)}
          />
          {entry.flightNumber && (
            <DetailItem
              icon={<Plane size={16} />}
              label="Flight"
              value={entry.flightNumber}
            />
          )}
          {entry.passengers.length > 0 && (
            <DetailItem
              icon={<UserRound size={16} />}
              label="Passengers"
              value={entry.passengers.join(", ")}
            />
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">
            Allocation
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AllocationCard
              type="vehicle"
              image={entry.vehiclePic}
              name={entry.vehicleName || "Vehicle requested"}
              primaryDetail={entry.vehicleNumber || "Allocation pending"}
              secondaryDetail={[entry.brand, entry.category]
                .filter(Boolean)
                .join(" / ")}
            />
            <AllocationCard
              type="driver"
              image={entry.driverPic}
              name={entry.driverName || "Driver pending"}
              primaryDetail={entry.driverPhone}
              secondaryDetail={entry.driverGender}
              ratingAverage={entry.driverRatingAverage}
              ratingCount={entry.driverRatingCount}
            />
          </div>
        </div>

        {(entry.startingKM != null ||
          entry.closingKM != null ||
          entry.startAt ||
          entry.endAt ||
          entry.runningDays != null) && (
          <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">
              Running details
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InlineMetric label="Start" value={entry.startAt ? instantToReadable(entry.startAt) : null} />
              <InlineMetric label="End" value={entry.endAt ? instantToReadable(entry.endAt) : null} />
              <InlineMetric label="Starting KM" value={entry.startingKM?.toString()} />
              <InlineMetric label="Closing KM" value={entry.closingKM?.toString()} />
              <InlineMetric label="Running days" value={entry.runningDays?.toString()} />
            </div>
          </div>
        )}

        {(entry.extraChargebleDistance ||
          entry.extraChargebleTime ||
          entry.nightChargeble ||
          entry.charges.length > 0) && (
          <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">
              Charges
            </p>
            <div className="space-y-2 text-sm">
              <InlineMetric
                label="Base fare"
                value={displayMoney(entry.packageSnapshot.baseFare)}
              />
              <InlineMetric
                label="Extra distance"
                value={
                  entry.extraChargebleDistance
                    ? `${entry.extraChargebleDistance} km`
                    : null
                }
              />
              <InlineMetric
                label="Extra time"
                value={
                  entry.extraChargebleTime
                    ? `${entry.extraChargebleTime} hr`
                    : null
                }
              />
              <InlineMetric
                label="Night charge"
                value={
                  entry.nightChargeble
                    ? displayMoney(entry.packageSnapshot.nightCharge)
                    : null
                }
              />
              {entry.charges.map((charge) => (
                <InlineMetric
                  key={charge.id}
                  label={charge.description}
                  value={displayMoney(charge.amount)}
                />
              ))}
            </div>
          </div>
        )}

        {entry.clientNotes && (
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/72">
            <ReceiptText size={16} className="mt-0.5 shrink-0 text-[#d8b25c]" />
            <p>{entry.clientNotes}</p>
          </div>
        )}

        {entry.status === DutyStatus.COMPLETED && (
          <DutyRatingSection dutyId={entry.dutyId} />
        )}
      </div>
    </article>
  );
}

/* =====================================================
   SHARE TRIP
   ===================================================== */

function ShareTripButton({ dutyId }: { dutyId: string }) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    try {
      setSharing(true);
      const { token } = await ClientBookingService.createShareLink(dutyId);
      const url = `${window.location.origin}/track/${token}`;
      const result = await shareTripLink(url);

      if (result === "clipboard") {
        toast.success("Link copied");
      }
    } catch (err) {
      console.error("Failed to create trip share link", err);
      toast.error("Couldn't create a share link. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="
        inline-flex items-center gap-2
        px-3 py-2
        rounded-xl
        lux-control
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition
        text-sm
      "
    >
      <Link2 size={15} />
      {sharing ? "Preparing link…" : "Share trip"}
    </button>
  );
}

/* =====================================================
   RATING
   ===================================================== */

function DutyRatingSection({ dutyId }: { dutyId: string }) {
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<DutyRatingResponse | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    ClientBookingService.getRating(dutyId)
      .then((res) => {
        if (!cancelled) setRating(res ?? null);
      })
      .catch(() => {
        // Best-effort -- treat as unrated if the lookup fails.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dutyId]);

  const handleSubmit = async () => {
    if (stars < 1) return;

    try {
      setSubmitting(true);
      const saved = await ClientBookingService.submitRating(
        dutyId,
        stars,
        comment.trim() || null
      );
      setRating(saved);
      toast.success("Thanks for rating your trip!");
    } catch (err) {
      console.error("Failed to submit rating", err);
      toast.error("Couldn't submit your rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101114] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">
        Trip rating
      </p>

      {rating ? (
        <div>
          <StarRow value={rating.stars} />
          {rating.comment && (
            <p className="mt-2 text-sm text-white/68">{rating.comment}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-white/68">Rate this trip</p>
          <StarRow value={stars} onChange={setStars} />
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment…"
            className="lux-input-dark w-full rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={stars < 1 || submitting}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit rating"}
          </button>
        </div>
      )}
    </div>
  );
}

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange?: (stars: number) => void;
}) {
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <Star
            size={20}
            className={n <= value ? "fill-[#d8b25c] text-[#d8b25c]" : "text-white/25"}
          />
        </button>
      ))}
    </div>
  );
}

function AllocationCard({
  type,
  image,
  name,
  primaryDetail,
  secondaryDetail,
  ratingAverage,
  ratingCount,
}: {
  type: "vehicle" | "driver";
  image?: string | null;
  name: string;
  primaryDetail?: string | null;
  secondaryDetail?: string | null;
  ratingAverage?: number | null;
  ratingCount?: number;
}) {
  const isVehicle = type === "vehicle";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101114]">
      <div
        className={`relative flex h-36 items-center justify-center ${
          isVehicle ? "bg-[#f5f1e8]" : "bg-white/8"
        }`}
      >
        <Image
          src={
            getFileUrl(image) ||
            (isVehicle ? "/placeholder-car-png.webp" : "/user.png")
          }
          alt={name}
          fill
          className={isVehicle ? "object-contain p-3" : "object-cover"}
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {isVehicle ? "Vehicle" : "Driver"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-[#d8b25c]">
            {isVehicle ? <Car size={16} /> : <UserRound size={16} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            {primaryDetail && (
              <p className="mt-1 truncate text-xs text-white/62">
                {primaryDetail}
              </p>
            )}
            {secondaryDetail && (
              <p className="mt-1 truncate text-xs text-white/42">
                {secondaryDetail}
              </p>
            )}
            {!isVehicle && ratingCount != null && ratingCount > 0 && ratingAverage != null && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[#f2d384]">
                <Star size={12} className="fill-[#f2d384] text-[#f2d384]" />
                {ratingAverage.toFixed(1)} ({ratingCount} ride{ratingCount === 1 ? "" : "s"})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutePoint({
  label,
  location,
  time,
}: {
  label: string;
  location: string;
  time?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <MapPin size={16} className="mt-0.5 shrink-0 text-[#d8b25c]" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-white/42">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-white">{location}</p>
        <p className="mt-1 text-xs text-white/50">
          {time ? instantToReadable(time) : "Time pending"}
        </p>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string | null;
}) {
  if (!value && !helper) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101114] p-3">
      <div className="mb-2 flex items-center gap-2 text-[#d8b25c]">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-white/50">{helper}</p>}
    </div>
  );
}

function InlineMetric({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function DutyStatusPill({ status }: { status: DutyStatus }) {
  const variants: Record<DutyStatus, string> = {
    REQUESTED: "bg-amber-500/18 text-amber-900",
    ALLOTTED: "bg-emerald-500/18 text-emerald-900",
    RUNNING: "bg-blue-500/18 text-blue-900",
    COMPLETED: "bg-sky-500/18 text-sky-900",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${variants[status]}`}>
      {displayDutyStatus(status)}
    </span>
  );
}

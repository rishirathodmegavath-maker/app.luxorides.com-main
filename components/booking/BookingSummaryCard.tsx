import { ClientBookingDTO } from "@/types";
import { displayMoney } from "@/lib/utils";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { instantToReadable } from "@/lib/date";
import { Building2, CalendarDays, FileText, ReceiptIndianRupee } from "lucide-react";

type Props = {
  booking: ClientBookingDTO;
  taxableAmount: number;
  pendingAmount: number;
  onPay?: () => void;
};

export function BookingSummaryCard({
  booking,
  taxableAmount,
  pendingAmount,
  onPay,
}: Props) {
  const gst = booking.gstSnapshot;

  return (
    <div className="lux-card rounded-[28px] p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d8b25c]">
            Booking summary
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold tracking-wide">
            #{booking.bookingId}
          </h3>
        </div>

        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#101114] p-4 text-sm">
        <SummaryMeta
          icon={<CalendarDays size={15} />}
          label="Created"
          value={instantToReadable(booking.createdAt)}
        />
        {booking.clientBillingEntityName && (
          <SummaryMeta
            icon={<Building2 size={15} />}
            label="Billing entity"
            value={booking.clientBillingEntityName}
          />
        )}
        {booking.invoiceNumber && (
          <SummaryMeta
            icon={<FileText size={15} />}
            label="Invoice"
            value={booking.invoiceNumber}
          />
        )}
      </div>

      {/* ================= AMOUNT BREAKDOWN ================= */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ReceiptIndianRupee size={16} className="text-[#d8b25c]" />
          <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
            Amount breakdown
          </p>
        </div>
        <div className="space-y-2 text-sm">
        {/* Taxable */}
        {taxableAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-white/60">Taxable Amount</span>
            <span className="font-semibold">
              {displayMoney({
                amount: taxableAmount,
                currency: booking.total.currency,
              })}
            </span>
          </div>
        )}

        {/* IGST */}
        {gst.igstAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-white/60">IGST</span>
            <span className="font-medium">
              {displayMoney({
                amount: gst.igstAmount,
                currency: booking.total.currency,
              })}
            </span>
          </div>
        )}

        {/* CGST */}
        {gst.cgstAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-white/60">CGST</span>
            <span className="font-medium">
              {displayMoney({
                amount: gst.cgstAmount,
                currency: booking.total.currency,
              })}
            </span>
          </div>
        )}

        {/* SGST */}
        {gst.sgstAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-white/60">SGST</span>
            <span className="font-medium">
              {displayMoney({
                amount: gst.sgstAmount,
                currency: booking.total.currency,
              })}
            </span>
          </div>
        )}

        <div className="border-t border-white/10 my-2" />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-white/80 font-medium">Total Amount</span>
          <span className="font-semibold">{displayMoney(booking.total)}</span>
        </div>
        </div>
      </div>

      {/* Pending + CTA */}
      {pendingAmount > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
          <div>
            <p className="text-xs text-white/60">Pending Amount</p>
            <p className="text-base font-semibold text-rose-300">
              {displayMoney({
                amount: pendingAmount,
                currency: booking.total.currency,
              })}
            </p>
          </div>

          <button
            onClick={onPay}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/85"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#d8b25c]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-white/45">{label}</p>
        <p className="truncate text-white/78">{value}</p>
      </div>
    </div>
  );
}

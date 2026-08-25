import { BookingListEntry, BookingStatus } from "@/types";
import { displayBookingStatus } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: BookingListEntry["status"] }) {
  const base = "text-xs px-2.5 py-1 rounded-full capitalize font-medium";

 const variants: Record<BookingStatus, string> = {
  DRAFT: "bg-slate-400/20 text-slate-300",
  CONFIRMED: "bg-indigo-400/20 text-indigo-300",
  RUNNING: "bg-emerald-400/20 text-emerald-300",
  COMPLETED: "bg-sky-400/20 text-sky-300",
  BILLED: "bg-amber-400/20 text-amber-300",
  CANCELLED: "bg-rose-400/20 text-rose-300",
} as const;


  return (
    <span className={`${base} ${variants[status]}`}>
      {displayBookingStatus(status)}
    </span>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Name, DisplayAddress } from "@/types/client";
import {
  BookingStatus,
  DutyStatus,
  DutyType,
  Money,
  PackageSnapshot,
} from "@/types/booking";
import { VehicleCatalogPackage, VehicleItinerary } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* =====================================================
   NAME FORMATTER
   ===================================================== */

export function displayName(
  name?: Name | null,
  fallback = "Unnamed Client",
): string {
  if (!name) return fallback;

  return (
    [name.salutation, name.firstName, name.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || fallback
  );
}

/* =====================================================
   ADDRESS FORMATTER
   ===================================================== */

export function displayAddress(address?: DisplayAddress | null): string {
  if (!address) return "";

  return [
    address.formattedAddress,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

/* =====================================================
   MONEY FORMATTER
   ===================================================== */

export function displayMoney(money?: Money | null, fallback = "—"): string {
  if (!money || money.amount == null) return fallback;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: money.currency || "INR",
      maximumFractionDigits: 0,
    }).format(money.amount);
  } catch {
    return `${money.amount}`;
  }
}

/* =====================================================
   DUTY / PACKAGE FORMATTERS
   ===================================================== */

export function displayDutyType(duty?: string | null, fallback = "Trip"): string {
  switch (duty) {
    case DutyType.TRANSFER:
    case DutyType.AIRPORT_DROP:
    case DutyType.AIRPORT_PICKUP:
      return "Transfer";
    case DutyType.LOCAL:
      return "Local";
    case DutyType.OUTSTATION:
      return "Outstation";
    case DutyType.CUSTOM:
      return "Custom";
    default:
      return duty || fallback;
  }
}

export function displayBookingStatus(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.DRAFT:
      return "Pending Confirmation";
    case BookingStatus.RUNNING:
      return "In Progress";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export function displayDutyStatus(status: DutyStatus): string {
  switch (status) {
    case DutyStatus.REQUESTED:
      return "Awaiting Confirmation";
    case DutyStatus.ALLOTTED:
      return "Confirmed";
    case DutyStatus.RUNNING:
      return "In Progress";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export function displayPackageSummary(
  pkg?: Pick<PackageSnapshot, "dutyType" | "time" | "unit" | "distance"> |
    VehicleCatalogPackage |
    null,
): string {
  if (!pkg) return "Trip";

  const label = displayDutyType(pkg.dutyType);

  if (
    pkg.dutyType === DutyType.TRANSFER ||
    pkg.dutyType === DutyType.AIRPORT_DROP ||
    pkg.dutyType === DutyType.AIRPORT_PICKUP
  ) {
    return label;
  }

  const time = "time" in pkg ? pkg.time : undefined;
  const unit = "unit" in pkg ? pkg.unit : undefined;
  const distance = "distance" in pkg ? pkg.distance : undefined;

  if (time && unit && distance) {
    return `${label} (${time} ${unit}, ${distance} km)`;
  }

  return label;
}

export function toVehicleItinerarySearch(itinerary: VehicleItinerary) {
  return {
    dutyType: itinerary.dutyType,
    reportingLocation: itinerary.reportingLocation!,
    reportingTime: itinerary.reportingTime,
    dropLocation: itinerary.dropLocation ?? undefined,
    bookingDays: itinerary.bookingDays ?? undefined,
  };
}
import { ApiError } from "@/types/api-error";

export function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  status?: number;
} {
  // 🔥 Handle Error with JSON string inside message
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as ApiError;

      return {
        message: parsed.message,
        code: parsed.code,
        status: parsed.status,
      };
    } catch {
      return { message: error.message };
    }
  }

  // Direct ApiError
  if (typeof error === "object" && error !== null && "message" in error) {
    const apiError = error as ApiError;
    return {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
    };
  }

  return { message: "Something went wrong!!!" };
}

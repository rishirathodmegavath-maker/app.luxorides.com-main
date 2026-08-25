// lib/itinerary.validation.ts
import { DutyType, VehicleItinerary } from "@/types";

export function isItineraryValid(v?: VehicleItinerary): boolean {
  if (!v) return false;

  if (!v.reportingLocation || !v.reportingTime) return false;

  if (v.dutyType === DutyType.TRANSFER) {
    return !!v.dropLocation;
  }

  if (v.dutyType === DutyType.OUTSTATION) {
    return !!v.bookingDays && v.bookingDays > 0;
  }

  return true; // LOCAL
}

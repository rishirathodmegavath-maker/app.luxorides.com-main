import { BookingStatus } from "./booking.types";

export interface BookingListEntry {
  bookingId: string;
  vehicle: string;
  location: string;
  from: string;
  till: string;
  status: BookingStatus;
  duties: number; // number of duties in booking
}

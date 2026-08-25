//app/types/booking/booking.form.tpes.ts

import { DutyType } from "./booking.types";

// interfaces/address-snapshot.ts
export type AddressSnapshot = {
  formattedAddress: string;
  googlePlaceId: string;
  latitude: number;
  longitude: number;
};

export interface BookingDraftForm {
  clientBillingEntityId?: string;
  entries: BookingEntryForm[];
}

export interface BookingEntryForm {
  /** Vehicle selection */
  vehicleId: string;

  /** Duty configuration */
  packageId?: string;

  /** Core itinerary */
  reportingLocation: AddressSnapshot;
  reportingTime: string;

  /** Transfer-specific */
  dropLocation?: AddressSnapshot;
  dropTime?: string;

  /** Outstation-specific */
  bookingDays?: number;

  /** Optional operational data */
  flightNumber?: string;

  /** Passenger mapping */
  passengerIds: string[];

  /** Client-visible notes */
  clientNotes?: string;
}

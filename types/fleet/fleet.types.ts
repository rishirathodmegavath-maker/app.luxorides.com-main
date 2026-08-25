// app/fleet/fleet.types.ts

import { AddressSnapshot, DutyType } from "../booking";
import { VehicleCatalog, VehicleCatalogPackage } from "../vehicle";

export interface CartItem {
  id: string;
  vehicleId: string;
  vehicle: VehicleCatalog;

  itinerary?: VehicleItinerary;

  /** Backend validation snapshot */
  validation?: {
    warning?: string | null;
    validatedAt: string;
  };

  createdAt: string;
}


export interface VehicleItinerary {
  dutyType: DutyType;

  reportingLocation: AddressSnapshot | null;
  reportingTime: string;

  dropLocation?: AddressSnapshot | null;
  dropTime?: string;

  /** Transfer / Local / Outstation */
  packageId?: string;

  /** Outstation only */
  bookingDays?: number;

  /** Transfer only (optional) */
  flightNumber?: string;

  /** Shared optional */
  passengerIds?: string[];
  billingEntityId?: string;
  clientNotes?: string;
}

export interface ItineraryInput {
  dutyType: DutyType;
  reportingLocation: AddressSnapshot;
  reportingTime: string;
  dropLocation?: AddressSnapshot | null;
  bookingDays?: number;
}

export interface VehicleValidationResponse {
  vehicleId: string;
  selectedPackage: VehicleCatalogPackage;
  warning?: string | null;
}

//app/types/booking/booking.tpes.ts
/* =====================================================
   CORE MONEY & SNAPSHOTS
   ===================================================== */

export interface Money {
  amount: number; // already scaled (2 decimals)
  currency: string; // "INR"
}

export interface GstSnapshot {
  gstType: string; // IGST | CGST_SGST | EXEMPT
  gstRate: number | null;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
}

export interface PackageSnapshot {
  packageId: string;
  scope: string; // HOURLY | OUTSTATION | etc.
  dutyType: DutyType;
  time: number;
  distance: number;
  unit: string;

  baseFare: Money;
  extraPerKM: Money;
  extraPerHS: Money;
  nightCharge: Money;
}

/* =====================================================
   ENUM-LIKE TYPES (keep as unions for FE safety)
   ===================================================== */

export enum BookingStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  BILLED = "BILLED",
}

export enum DutyType {
  TRANSFER = "TRANSFER",
  LOCAL = "LOCAL",
  OUTSTATION = "OUTSTATION",
  AIRPORT_DROP = "AIRPORT_DROP",
  AIRPORT_PICKUP = "AIRPORT_PICKUP",
  CUSTOM = "CUSTOM",
}

export enum DutyStatus {
  REQUESTED = "REQUESTED",
  ALLOTTED = "ALLOTTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
}

export enum PaymentMode {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  UPI = "UPI",
  CARD = "CARD",
  RAZORPAY = "RAZORPAY",
}

/* =====================================================
   CLIENT BOOKING DTO
   ===================================================== */

export interface ClientBookingDTO {
  bookingId: string;
  clientBillingEntityName: string | null;
  gstSnapshot: GstSnapshot;
  invoiceNumber: string;

  status: BookingStatus;
  createdAt: string; // ISO-8601
  total: Money;

  entries: ClientBookingEntry[];
  payments: ClientBookingPayment[];
}

/* =====================================================
   BOOKING ENTRY
   ===================================================== */

export interface ClientBookingEntry {
  dutyId: string;
  status: DutyStatus;

  packageSnapshot: PackageSnapshot;
  passengers: string[];

  // Vehicle (nullable if not allotted)
  vehicleName: string | null;
  vehiclePic: string | null;
  vehicleNumber: string | null;
  brand: string | null;
  category: string | null;

  // Driver (nullable if not allotted)
  driverName: string | null;
  driverPic: string | null;
  driverGender: string | null;
  driverPhone: string | null;
  driverRatingAverage: number | null; // 1-5, null until the driver has any ratings
  driverRatingCount: number; // 0 if none

  reportingLocation: string;
  reportingTime: string | null;
  startingKM: number | null;
  startAt: string | null;
  arrivedAtPickupAt: string | null; // set once the driver taps "Arrived at Pickup" in the driver app

  dropLocation: string;
  dropTime: string | null;
  closingKM: number | null;
  endAt: string | null;

  flightNumber: string | null;

  runningDays: number | null;
  extraChargebleDistance: number | null;
  extraChargebleTime: number | null;
  nightChargeble: boolean | null;

  dutyTotal: Money;
  clientNotes: string | null;

  charges: ClientBookingExtraCharge[];
}

/* =====================================================
   LIVE DRIVER LOCATION (WS push + REST fallback)
   Mirrors com.core.dtos.driverduty.DriverDutyLocationResponse.
   ===================================================== */

export interface DriverDutyLocationResponse {
  dutyId: string;
  latitude: number | null;
  longitude: number | null;
  headingDegrees: number | null;
  capturedAt: string | null;
  distanceRemainingKm: number | null;
  etaMinutes: number | null;
  etaEstimated: boolean; // always true today -- straight-line/instant-speed estimate, not routed
}

/* =====================================================
   TRIP SHARE
   ===================================================== */

export interface TripShareLinkResponse {
  token: string;
  expiresAt: string;
}

/* =====================================================
   CANCELLATION + REFUND
   ===================================================== */

export interface CancelPreviewResponse {
  withinFreeWindow: boolean;
  paidAmount: number;
  feeAmount: number;
  refundAmount: number;
  freeWindowHours: number | null;
  feePercent: number | null;
}

/* =====================================================
   PUBLIC TRIP TRACKING (unauthenticated, shared-link view)
   Backend: GET /public/trip/{token}
   ===================================================== */

export interface PublicTripStatusResponse {
  dutyStatus: DutyStatus;
  driverFirstName: string | null;
  vehicleName: string | null;
  vehicleNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  headingDegrees: number | null;
  capturedAt: string | null;
  distanceRemainingKm: number | null;
  etaMinutes: number | null;
  arrivedAtPickupAt: string | null;
}

/* =====================================================
   RATINGS
   ===================================================== */

export interface DutyRatingResponse {
  dutyId: string;
  stars: number;
  comment: string | null;
  createdAt: string;
}

/* =====================================================
   PAYMENTS (ONLY COMPLETED ON CLIENT SIDE)
   ===================================================== */

export interface ClientBookingPayment {
  paymentId: string;
  paymentMode: PaymentMode;

  transactionNumber: string | null;
  transactionDate: string | null;

  paymentAmount: Money;
}

/* =====================================================
   EXTRA CHARGES
   ===================================================== */

export interface ClientBookingExtraCharge {
  id: string;
  description: string;
  amount: Money;
}

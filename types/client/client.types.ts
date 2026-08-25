/* ================= ENUMS AND EMBEDS ================= */

export interface Name{
  salutation:string;
  firstName:string;
  lastName?:string;
}

export interface DisplayAddress {
  formattedAddress: string;
  city: string;
  state: string;
  pincode: string;
  countryCode: string;
}

/* ================= CLIENT ================= */

export interface Client {
  id: string;
  orgId: string;
  userId: string;

  name: Name;
  phone: string;

  email?: string | null;
  address?: DisplayAddress;
  pic?: string | null;

  clientBillingEntity: ClientBillingEntity[];
  passengers: Passenger[];

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/* ================= Passenger ================= */

export interface Passenger {
  id: string;
  name: Name;
  phone: string;
  email?: string;
}

/* ================= BILLING ENTITY ================= */

export interface ClientBillingEntity {
  id: string;
  brandName?: string;
  legalName: string;
  address: DisplayAddress;
  cin?: string;
  gstin: string;
  phone?: string;
  email?: string;
  businessType?: string;
}


/* ================= PROFILE UPDATE ================= */

/**
 * Matches backend:
 * com.core.dtos.client.app.ClientProfileUpdateRequest
 */
export interface ClientProfileUpdateRequest {
  name: Name;
  email?: string | null;
  address?: DisplayAddress | null;
}

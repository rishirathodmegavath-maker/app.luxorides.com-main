// types/cart.ts
export type Address = {
  label?: string;     // human label like "Hotel Taj"
  street?: string;    // raw address text
  city?: string;
  state?: string;
  pincode?: string;
  lat?: number | null;
  lng?: number | null;
};

export type Upsell = {
  id: string;
  type: "extraKm" | "extraHour" | "decoration" | "specialNeed";
  label: string;
  qty?: number;
  price: number;
};

export type Itinerary = {
  reportingAddress?: Address | null;
  reportingTime?: string | null; // ISO timestamp
  dropAddress?: Address | null;
  dropTime?: string | null; // ISO timestamp
  passengerName?: string | null;
  notes?: string | null; // any special notes
  upsells?: Upsell[] | null;
};

export type CarSnapshot = {
  id: string | number;
  name: string;
  brand?: string;
  featuredImage?: string;
  pricePerDay?: number;
  priceCurrency?: string;
  location?: string;
};

export type CartItem = {
  id: string;
  carId: string | number;
  car: CarSnapshot;
  quantity: number;
  itinerary?: Itinerary | null;
  createdAt: string;
};

// types/car.ts
export type Car = {
  id: string | number;
  brand?: string;
  category?: string;
  name: string;
  featuredImage?: string;
  pricePerDay?: number;
  priceCurrency?: string;
  location?: string;
  rating?: number;
  chauffeur?: boolean;
  isAvailable?: boolean;
  link: string;
};

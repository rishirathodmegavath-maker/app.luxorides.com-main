/* =====================================================
   VEHICLE CATALOG (CLIENT APP)
   Matches: VehicleCatalogDTO
   ===================================================== */

import { Money } from "../booking";

export interface VehicleCatalog {
  id: string;
  name: string;
  pic?: string | null;

  fuelSystem?: string;
  fuelConsumption?: string;
  vehicleColor?: string;

  category?: string;
  brand?: string;

  seats?: string;
  doors?: string;
  transmissionType?: string;
  horsePower?: string;
  vehicleClass?: string;
  modelYear?: string;
  performance?: string;

  dimension_length?: number;
  dimension_width?: number;
  dimension_height?: number;
  dimension_wheelbase?: number;

  slug?: string;

  rating?: number;
  popularity?: number;

  chauffeurDriven?: boolean;

  /** derived */
  startingPrice?: Money;

  packages: VehicleCatalogPackage[];
}

/* ================= PACKAGE ================= */

export interface VehicleCatalogPackage {
  packageId: string;
  dutyType: string;
  baseFare: Money;
  extraPerKM: Money;
  extraPerHS: Money;
  nightCharge: Money;
}

/* ================= FILTER META ================= */

export interface VehicleCatalogFilters {
  brands: string[];
  categories: string[];
}

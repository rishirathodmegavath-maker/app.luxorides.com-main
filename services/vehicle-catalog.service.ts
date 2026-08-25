import {
  PageResponse,
  ItineraryInput,
  VehicleCatalog,
  VehicleCatalogFilters,
  VehicleValidationResponse,
} from "@/types";
import { privateApi } from "./api.private";

const DEFAULT_LOCATION = "Delhi";

/* =====================================================
   VEHICLE CATALOG SERVICE (FINAL - MATCHES BACKEND)
   ===================================================== */

export const VehicleCatalogService = {
  /* ================= TRENDING ================= */

  trending(params: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<VehicleCatalog>> {
    const query = new URLSearchParams();

    query.set("location", DEFAULT_LOCATION);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));

    return privateApi<PageResponse<VehicleCatalog>>(
      `/client/app/catalog/trending?${query.toString()}`
    );
  },

  /* ================= EXPLORER ================= */

  explorer(params: {
    location: string;
    searchStr?: string;
    brands?: string[];
    categories?: string[];
    page?: number;
    size?: number;
  }): Promise<PageResponse<VehicleCatalog>> {
    const query = new URLSearchParams();

    query.set("location", params.location);

    if (params.searchStr) query.set("searchStr", params.searchStr);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));

    params.brands?.forEach((b) => query.append("brands", b));
    params.categories?.forEach((c) => query.append("categories", c));

    return privateApi<PageResponse<VehicleCatalog>>(
      `/client/app/catalog/explorer?${query.toString()}`
    );
  },

  /* ================= FILTER META ================= */

  filters(): Promise<VehicleCatalogFilters> {
    return privateApi<VehicleCatalogFilters>(
      "/client/app/catalog/filters"
    );
  },

  /* ================= SEARCH BY ITINERARY (QBW) ================= */

  searchByItinerary(
    itinerary: ItineraryInput,
    pagination: {
      page?: number;
      size?: number;
    } = {},
  ): Promise<PageResponse<VehicleCatalog>> {
    const query = new URLSearchParams();

    if (pagination.page !== undefined)
      query.set("page", String(pagination.page));
    if (pagination.size !== undefined)
      query.set("size", String(pagination.size));

    return privateApi<PageResponse<VehicleCatalog>>(
      `/client/app/catalog/vehicles/search-by-itinerary?${query.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itinerary),
      }
    );
  },

  /* ================= VALIDATE VEHICLE (Fleet Flow) ================= */

  validate(
    vehicleId: string,
    itinerary: ItineraryInput,
  ): Promise<VehicleValidationResponse> {
    return privateApi<VehicleValidationResponse>(
      `/client/app/catalog/${vehicleId}/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itinerary),
      }
    );
  },
};

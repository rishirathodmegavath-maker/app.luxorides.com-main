"use client";

import { useState } from "react";
import { useClientAuth } from "../auth/ClientAuthContext";
import {
  displayName,
  getErrorDetails,
  toVehicleItinerarySearch,
} from "@/lib/utils";
import { DutyType, VehicleCatalog, VehicleItinerary } from "@/types";
import { VehicleCatalogService } from "@/services/vehicle-catalog.service";
import { useCart } from "@/components/fleet/CartContext";
import { useView } from "@/components/views/ViewContext";

import QuickBookingRequiredForm from "./QuickBookingRequiredForm";
import QuickBookingVehicleList from "./QuickBookingVehicleList";
import QuickBookingOptionalForm from "./QuickBookingOptionalForm";
import { toast } from "sonner";

/* ========================================================= */

function getGreetingByTime(): string {
  try {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 20) return "Good Evening";
    return "Hello";
  } catch {
    return "Hello";
  }
}

/* ========================================================= */

export default function QuickBookingManager() {
  const { client } = useClientAuth();
  const { addVehicle, updateItem, clearCart } = useCart();
  const { setView } = useView();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [itinerary, setItinerary] = useState<VehicleItinerary>({
    dutyType: DutyType.TRANSFER,
    reportingLocation: null,
    reportingTime: "",
    passengerIds: [],
  });

  const [vehicles, setVehicles] = useState<VehicleCatalog[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [cartItemId, setCartItemId] = useState<string | null>(null);

  /* ================= FETCH VEHICLES ================= */

  const fetchVehicles = async (reset = false) => {
    if (loading) return;

    setLoading(true);

    try {
      const currentPage = reset ? 0 : page;

      const res = await VehicleCatalogService.searchByItinerary(
        toVehicleItinerarySearch(itinerary),
        {
          page: currentPage,
          size: 10,
        },
      );

      setVehicles((prev) => (reset ? res.content : [...prev, ...res.content]));

      setHasMore(currentPage < res.page.totalPages - 1);
      setPage(currentPage + 1);

      // ✅ Empty state feedback (only on first load)
      if (reset && res.content.length === 0) {
        toast.info("No vehicles available for selected criteria");
      }
    } catch (err: unknown) {
      const { message } = getErrorDetails(err);

      console.error("Vehicle search failed:", message);

      // ❌ Avoid spam on infinite scroll
      if (reset) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= VEHICLE SELECT ================= */

  const handleVehicleSelect = async (vehicle: VehicleCatalog) => {
    const loadingToast = toast.loading("Validating vehicle...");

    try {
      const res = await VehicleCatalogService.validate(
        vehicle.id,
        toVehicleItinerarySearch(itinerary),
      );

      toast.dismiss(loadingToast);

      const validatedVehicle: VehicleCatalog = {
        ...vehicle,
        packages: [res.selectedPackage],
        startingPrice: res.selectedPackage.baseFare,
      };

      const validatedItinerary: VehicleItinerary = {
        ...itinerary,
        dutyType: res.selectedPackage.dutyType as DutyType,
        packageId: res.selectedPackage.packageId,
      };

      // QB is single vehicle → clear cart
      clearCart();

      const item = addVehicle({
        vehicleId: validatedVehicle.id,
        vehicle: validatedVehicle,
        itinerary: validatedItinerary,
        validation: {
          warning: res.warning ?? null,
          validatedAt: new Date().toISOString(),
        },
      });

      setItinerary(validatedItinerary);
      setCartItemId(item.id);
      setStep(3);

      // ✅ success toast
      toast.success("Vehicle added");

      // ⚠️ backend warning
      if (res.warning) {
        toast.warning(res.warning);
      }
    } catch (err: unknown) {
      toast.dismiss(loadingToast);

      const { message } = getErrorDetails(err);

      toast.error(message);
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="w-full">
      <div className="flex justify-center">
        <div
          className="
            w-full
            app-screen
            text-white
          "
        >
          {/* Header */}
          <div className="mb-5 justify-center flex flex-row">
            <div className="mt-2">
              <p className="text-xl font-medium leading-tight text-white/72 sm:text-2xl">
                {getGreetingByTime()},
              </p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {displayName(client?.name)}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/64">
                Reserve Premium chauffeur-driven transfers, rentals, and bespoke
                journeys.
              </p>
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex justify-center">
              <QuickBookingRequiredForm
                itinerary={itinerary}
                onChange={setItinerary}
                onContinue={() => {
                  setVehicles([]);
                  setPage(0);
                  setHasMore(true);
                  setStep(2);
                  fetchVehicles(true);
                }}
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <QuickBookingVehicleList
              vehicles={vehicles}
              loading={loading}
              hasMore={hasMore}
              onScrollEnd={() => fetchVehicles()}
              onSelect={handleVehicleSelect}
              onBack={() => setStep(1)}
            />
          )}

          {/* STEP 3 */}
          {step === 3 && cartItemId && (
            <QuickBookingOptionalForm
              value={itinerary}
              onSubmit={(v) => {
                setItinerary(v);
                updateItem(cartItemId, {
                  itinerary: v,
                });
                setView({ name: "booking-draft" });
              }}
              onSkip={() => {
                setView({ name: "booking-draft" });
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

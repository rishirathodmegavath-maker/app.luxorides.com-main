"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  CarFront,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  DutyType,
  VehicleCatalog,
  VehicleCatalogFilters,
  VehicleItinerary,
} from "@/types";

import { VehicleCatalogService } from "@/services/vehicle-catalog.service";

import { CarCard } from "../ui/CarCard";
import ExpandableCardGrid from "../ui/ExpandableCardGrid";
import { FilterPanel } from "../shared/filter-panel";
import RequiredItineraryModal from "@/components/shared/RequiredItineraryModal";
import { EXPLORE_LOCATIONS } from "@/lib/explore-locations";

import { useCart } from "@/components/fleet/CartContext";
import { useView } from "@/components/views/ViewContext";
import LoadingState from "../ui/LoadingState";

/* ========================================================= */

type SortOption = "popular" | "priceAsc" | "priceDesc" | "rating";

/* ========================================================= */

export default function ExploreView() {
  const sidebarRef = useRef<HTMLElement | null>(null);

  const { addVehicle } = useCart();
  const { setView } = useView();

  /* ================= MODAL STATE ================= */

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<VehicleCatalog | null>(null);
  const [intent, setIntent] = useState<"fleet" | "rent" | null>(null);

  /* ================= DATA ================= */

  const [cars, setCars] = useState<VehicleCatalog[]>([]);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [sort] = useState<SortOption>("popular");
  const [entryLocation, setEntryLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "";
  }, [isFilterOpen]);

  /* ================= FETCH FILTER META ================= */

  useEffect(() => {
    if (!selectedLocation) return;

    VehicleCatalogService.filters().then((res: VehicleCatalogFilters) => {
      setBrands(res?.brands ?? []);
      setCategories(res?.categories ?? []);
    });
  }, [selectedLocation]);

  /* ================= FETCH VEHICLES ================= */

  useEffect(() => {
    if (!selectedLocation) return;

    let cancelled = false;

    const fetchVehicles = async () => {
      try {
        setLoading(true);

        const res = await VehicleCatalogService.explorer({
          location: selectedLocation,
          searchStr: search || undefined,
          brands: selectedBrands.length ? selectedBrands : undefined,
          categories: selectedCategories.length
            ? selectedCategories
            : undefined,
          page: 0,
          size: 24,
        });

        if (cancelled) return;

        setCars(res.content);
      } catch (err) {
        console.error("Explorer fetch failed", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      cancelled = true;
    };
  }, [search, selectedLocation, selectedBrands, selectedCategories]);

  /* ================= SORT ================= */

  const visibleCars = useMemo(() => {
    const out = [...cars];

    const priceOf = (c: VehicleCatalog) =>
      c.startingPrice?.amount ?? Number.POSITIVE_INFINITY;

    if (sort === "priceAsc") out.sort((a, b) => priceOf(a) - priceOf(b));

    if (sort === "priceDesc") out.sort((a, b) => priceOf(b) - priceOf(a));

    if (sort === "rating")
      out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return out;
  }, [cars, sort]);

  /* ================= OPEN MODAL ================= */

  const openModal = (car: VehicleCatalog, mode: "fleet" | "rent") => {
    setSelectedCar(car);
    setIntent(mode);
    setModalOpen(true);
  };

  /* ================= CONFIRM ================= */

  const handleConfirm = async (itinerary: VehicleItinerary) => {
    if (!selectedCar) return;

    try {
      const res = await VehicleCatalogService.validate(selectedCar.id, {
        dutyType: itinerary.dutyType,
        reportingLocation: itinerary.reportingLocation!,
        reportingTime: itinerary.reportingTime,
        dropLocation: itinerary.dropLocation,
        bookingDays: itinerary.bookingDays,
      });

      console.log("Validation result", res);

      // 1️⃣ Attach backend-selected package to itinerary
      const validatedItinerary: VehicleItinerary = {
        ...itinerary,
        dutyType: res.selectedPackage.dutyType as DutyType,
        packageId: res.selectedPackage.packageId,
      };

      // 2️⃣ Replace vehicle packages with authoritative package
      const validatedVehicle: VehicleCatalog = {
        ...selectedCar,
        packages: [res.selectedPackage],
        startingPrice: res.selectedPackage.baseFare, // 🔥 authoritative price
      };

      // 3️⃣ Add to cart
      addVehicle({
        vehicleId: validatedVehicle.id,
        vehicle: validatedVehicle,
        itinerary: validatedItinerary,
        validation: {
          warning: res.warning ?? null,
          validatedAt: new Date().toISOString(),
        },
      });

      // 4️⃣ Redirect if rent
      if (intent === "rent") {
        setView({ name: "fleet" });
      }

      // 5️⃣ Cleanup
      setModalOpen(false);
      setSelectedCar(null);
      setIntent(null);
    } catch (err) {
      console.error("Vehicle validation failed", err);
    }
  };

  /* ================= RENDER ================= */

  if (!selectedLocation) {
    return (
      <LocationChooser
        onSelect={(location) => {
          setEntryLocation(location);
          setSelectedLocation(location);
        }}
      />
    );
  }

  return (
    <section className="app-screen">
      {/* HEADER */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d8b25c]">
          Fleet
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Choose your ride
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/58">
          <MapPin size={14} className="text-[#d8b25c]" />
          Vehicles available in {selectedLocation}
        </p>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles"
            className="lux-input-dark h-[52px] w-full rounded-full pl-11 pr-4 text-sm outline-none placeholder:text-white/42 focus:border-[#d8b25c]/55"
          />
        </div>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lux-control flex h-[52px] w-[52px] items-center justify-center rounded-full lg:hidden"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={19} />
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside
          ref={sidebarRef}
          className="sticky top-24 hidden self-start lg:col-span-3 lg:block"
        >
          <FilterPanel
            locations={EXPLORE_LOCATIONS}
            brands={brands}
            categories={categories}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            resetFilters={() => {
              setSearch("");
              setSelectedLocation(entryLocation);
              setSelectedBrands([]);
              setSelectedCategories([]);
            }}
          />
        </aside>

        <div className="lg:col-span-9">
          {loading && (
            <LoadingState
              label="Finding available vehicles"
              className="min-h-[280px]"
            />
          )}

          {!loading && visibleCars.length > 0 && (
            <ExpandableCardGrid
              cards={visibleCars}
              onAction={openModal}
              renderCard={(car, onClick) => (
                <CarCard car={car} onClick={onClick} />
              )}
            />
          )}

          {!loading && visibleCars.length === 0 && (
            <div className="lux-card flex min-h-[280px] items-center justify-center rounded-[28px] px-6 text-center">
              <p className="text-sm text-white/65">No vehicle available</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL — CLEAN VERSION */}
      <RequiredItineraryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCar(null);
          setIntent(null);
        }}
        onConfirm={handleConfirm}
      />

      {isFilterOpen && (
        <div className="lux-modal-backdrop fixed inset-0 z-50 lg:hidden">
          {/* PANEL CONTAINER */}
          <div className="absolute inset-0 overflow-y-auto p-4 pt-[calc(18px+env(safe-area-inset-top))]">
            <FilterPanel
              locations={EXPLORE_LOCATIONS}
              brands={brands}
              categories={categories}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              resetFilters={() => {
                setSearch("");
                setSelectedLocation(entryLocation);
                setSelectedBrands([]);
                setSelectedCategories([]);
              }}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function LocationChooser({ onSelect }: { onSelect: (location: string) => void }) {
  return (
    <section className="app-screen">
      <div className="mx-auto max-w-5xl">
        <div className="lux-card relative isolate overflow-hidden rounded-[34px] border-white/[0.09]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(216,178,92,0.16),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(216,178,92,0.09),transparent_32%)]" />
          <div className="pointer-events-none absolute -right-24 top-0 -z-10 h-64 w-64 rounded-full border border-[#d8b25c]/10" />
          <div className="pointer-events-none absolute -right-10 top-14 -z-10 h-40 w-40 rounded-full border border-[#d8b25c]/10" />

          <header className="border-b border-white/[0.08] px-5 py-7 sm:px-8 sm:py-9">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#d8b25c]" />
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#e5c779]">
                  Explore the collection
                </p>
              </div>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
                Select your service city
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/58 sm:text-[15px]">
                Discover a city-specific collection of chauffeur-driven
                vehicles and curated travel packages.
              </p>
            </div>
          </header>

          <div className="p-3 sm:p-5 lg:p-6">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {EXPLORE_LOCATIONS.map((location) => (
                <button
                  key={location}
                  onClick={() => onSelect(location)}
                  className="group relative flex min-h-[92px] items-center gap-4 overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.035] px-4 py-4 text-left outline-none transition duration-300 hover:-translate-y-0.5 hover:border-[#d8b25c]/35 hover:bg-[#d8b25c]/[0.07] focus-visible:border-[#e5c779] focus-visible:ring-2 focus-visible:ring-[#d8b25c]/30"
                  aria-label={`Explore vehicles in ${location}`}
                >
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#d8b25c]/0 to-transparent transition group-hover:via-[#d8b25c]/70" />
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[#e5c779] transition group-hover:border-[#d8b25c]/30 group-hover:bg-[#d8b25c]/10">
                    <MapPin size={17} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-white">
                      {location}
                    </span>
                    <span className="mt-1 block text-xs text-white/42 transition group-hover:text-white/58">
                      View available fleet
                    </span>
                  </span>
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.7}
                    className="shrink-0 text-white/28 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e5c779]"
                  />
                </button>
              ))}
            </div>
          </div>

          <footer className="grid border-t border-white/[0.08] sm:grid-cols-2">
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4 sm:border-b-0 sm:border-r sm:px-6">
              <CarFront
                size={17}
                strokeWidth={1.7}
                className="text-[#d8b25c]"
              />
              <p className="text-xs text-white/48">
                Fleet and packages tailored to your city
              </p>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <ShieldCheck
                size={17}
                strokeWidth={1.7}
                className="text-[#d8b25c]"
              />
              <p className="text-xs text-white/48">
                Your selection can be changed in filters
              </p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

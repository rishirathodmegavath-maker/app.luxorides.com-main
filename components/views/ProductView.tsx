"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeIndianRupee,
  Briefcase,
  CalendarClock,
  ChevronLeft,
  Fuel,
  Gauge,
  Luggage,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import RequiredItineraryModal from "@/components/shared/RequiredItineraryModal";
import { useCart } from "@/components/fleet/CartContext";
import { useView } from "@/components/views/ViewContext";
import { Button } from "@/components/ui/button";
import { VehicleCatalogService } from "@/services/vehicle-catalog.service";
import { DutyType, VehicleCatalog, VehicleItinerary } from "@/types";
import { getFileUrl } from "@/utils/file-url";
import {
  displayMoney,
  displayPackageSummary,
  getErrorDetails,
} from "@/lib/utils";

export default function ProductView({ vehicle }: { vehicle: VehicleCatalog }) {
  const close = () => window.history.back();
  const { addVehicle, items } = useCart();
  const { setView } = useView();
  const [modalOpen, setModalOpen] = useState(false);
  const [intent, setIntent] = useState<"fleet" | "rent" | null>(null);

  const cartCount = items.filter((item) => item.vehicleId === vehicle.id).length;
  const primaryPackage = vehicle.packages?.[0];

  const openModal = (mode: "fleet" | "rent") => {
    setIntent(mode);
    setModalOpen(true);
  };

  const handleConfirm = async (itinerary: VehicleItinerary) => {
    const loadingToast = toast.loading("Validating vehicle...");

    try {
      const res = await VehicleCatalogService.validate(vehicle.id, {
        dutyType: itinerary.dutyType,
        reportingLocation: itinerary.reportingLocation!,
        reportingTime: itinerary.reportingTime,
        dropLocation: itinerary.dropLocation,
        bookingDays: itinerary.bookingDays,
      });

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

      addVehicle({
        vehicleId: validatedVehicle.id,
        vehicle: validatedVehicle,
        itinerary: validatedItinerary,
        validation: {
          warning: res.warning ?? null,
          validatedAt: new Date().toISOString(),
        },
      });

      toast.success("Vehicle added successfully");

      if (res.warning) {
        toast.warning(res.warning);
      }

      if (intent === "rent") {
        setView({ name: "fleet" });
      }

      setModalOpen(false);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const { message, code } = getErrorDetails(err);
      console.error("API Error:", code, message);
      toast.error(message);
    }
  };

  return (
    <div className="lux-modal-backdrop fixed inset-0 z-50 flex md:items-center md:justify-center md:p-4">
      <div
        className="
          relative flex h-[100dvh] w-full flex-col overflow-hidden
          bg-[#101113] text-white
          md:h-[min(860px,92vh)] md:max-w-4xl md:rounded-[32px]
          md:border md:border-white/10
          md:shadow-[0_30px_90px_rgba(0,0,0,0.55)]
        "
      >
        <div
          className="
            relative min-h-[40dvh] overflow-hidden
            bg-linear-to-b from-[#e8e0d1] via-[#d1c7b7] to-[#111214]
            px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-8
            md:min-h-[360px]
          "
        >
          <div className="relative z-20 flex items-center justify-between">
            <button
              onClick={close}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white shadow-lg"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="rounded-full bg-black/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {vehicle.brand || "Luxorides"}
            </div>

            <div className="h-11 w-11" />
          </div>

          <div className="relative z-10 mx-auto mt-5 h-[220px] max-w-[560px] md:h-[260px]">
            <Image
              src={getFileUrl(vehicle.pic) || "/placeholder-car-png.webp"}
              alt={vehicle.name}
              fill
              className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.35)]"
              priority
              unoptimized
            />
          </div>

          <div className="absolute inset-x-10 bottom-6 h-14 rounded-full bg-black/20 blur-2xl" />
        </div>

        <div
          className="
            relative -mt-7 flex-1 overflow-y-auto rounded-t-[32px]
            bg-[#151517] px-5 pb-[calc(104px+env(safe-area-inset-bottom))] pt-6
            md:pb-6
          "
        >
          <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#d8b25c]/18 px-3 py-1 text-xs font-medium text-[#f2d384]">
                    Chauffeur driven
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    {vehicle.category || "Luxury cab"}
                  </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {vehicle.name}
                </h1>
                <p className="mt-1 text-sm text-white/58">
                  {vehicle.brand} / {vehicle.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SpecTile
                  icon={<Users size={17} />}
                  label="Seats"
                  value={`${vehicle.seats || 5}`}
                />
                <SpecTile
                  icon={<Settings size={17} />}
                  label="Gearbox"
                  value={vehicle.transmissionType || "Automatic"}
                />
                <SpecTile
                  icon={<Gauge size={17} />}
                  label="Power"
                  value={vehicle.horsePower ? `${vehicle.horsePower} HP` : "NA"}
                />
                <SpecTile
                  icon={<Fuel size={17} />}
                  label="Fuel"
                  value={vehicle.fuelSystem || "Included"}
                />
              </div>

              <div className="lux-panel rounded-[24px] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock size={17} className="text-[#f2d384]" />
                  <h2 className="text-sm font-semibold">Available packages</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {vehicle.packages?.length ? (
                    vehicle.packages.map((pkg) => (
                      <span
                        key={pkg.packageId}
                        className="rounded-full border border-white/10 bg-[#202024] px-3 py-2 text-xs text-white/78"
                      >
                        {displayPackageSummary(pkg)} /{" "}
                        <strong className="text-white">
                          {displayMoney(pkg.baseFare)}
                        </strong>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/55">
                      Package details will be confirmed at booking.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <aside className="lux-panel h-fit rounded-[24px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    From
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {displayMoney(vehicle.startingPrice)}
                  </p>
                </div>
                <BadgeIndianRupee size={24} className="text-[#f2d384]" />
              </div>

              <div className="mt-4 space-y-3 text-sm text-white/68">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-300" />
                  Verified chauffeur and quality checked vehicle
                </div>
                <div className="flex items-center gap-2">
                  <Luggage size={16} className="text-emerald-300" />
                  Suitable for airport, local, and business travel
                </div>
                {primaryPackage && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-emerald-300" />
                    {displayPackageSummary(primaryPackage)}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <div
          className="
            lux-bottom-bar fixed bottom-0 left-0 z-20 flex w-full gap-3 border-t
            p-4 pb-[calc(16px+env(safe-area-inset-bottom))]
            md:absolute
          "
        >
          <Button
            variant="glass-outline"
            size="icon"
            onClick={() => openModal("fleet")}
            className="relative"
            aria-label="Add to fleet"
          >
            <Image
              src="/fleet.svg"
              alt="Fleet"
              width={20}
              height={20}
              className="invert opacity-90"
            />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-[2px] text-center text-[10px] font-semibold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            className="flex-1 bg-white text-black hover:bg-white/85"
            onClick={() => openModal("rent")}
          >
            Book Now
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <RequiredItineraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

type SpecTileProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function SpecTile({ icon, label, value }: SpecTileProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#202024] p-3">
      <div className="mb-2 text-[#f2d384]">{icon}</div>
      <p className="text-[11px] uppercase tracking-wide text-white/42">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}

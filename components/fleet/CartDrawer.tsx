import Image from "next/image";
import { X } from "lucide-react";
import { getFileUrl } from "@/utils/file-url";
import { useCart } from "./CartContext";
import { useView } from "../views/ViewContext";
import { displayDutyType, displayMoney, displayPackageSummary } from "@/lib/utils";

export default function CartDrawer() {
  const { items, totalItems, open, closeCart, removeItem } = useCart();
  const { setView } = useView();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="lux-modal-backdrop absolute inset-0" onClick={closeCart} />

      {/* Drawer */}
      <aside
        className="
          lux-panel fixed z-50
          flex flex-col

          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0
          h-[85dvh]
          rounded-t-3xl
          border-t

          /* Tablet + Desktop: side drawer */
          md:top-0 md:bottom-0 md:right-0 md:left-auto
          md:h-[100dvh]
          md:w-[420px]
          md:rounded-none
          md:border-l md:border-t-0
        "
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-white text-lg font-semibold">Your Fleet</h3>
            <p className="text-white/70 text-sm">{totalItems} vehicles</p>
          </div>

          <button
            onClick={closeCart}
            className="text-white/80 hover:text-white"
            aria-label="Close cart"
          >
            <X />
          </button>
        </div>

        {/* Items (scrollable area) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex gap-3 p-3 rounded-xl bg-[#1e1e22] border border-white/10"
            >
              <div className="relative w-24 h-16 rounded-md overflow-hidden shrink-0">
                <Image
                  src={
                    getFileUrl(it.vehicle.pic) || "/placeholder-car-png.webp"
                  }
                  alt={it.vehicle.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {it.vehicle.name}
                </p>
                <p className="text-white/60 text-sm truncate">
                  {it.vehicle.brand} • {it.vehicle.category}
                </p>

                <p className="mt-1 text-white font-semibold">
                  {displayMoney(it.vehicle.startingPrice)}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {it.itinerary && (
                    <span className="rounded-full bg-[#d8b25c]/15 px-2 py-1 text-[11px] text-[#f2d384]">
                      {displayDutyType(it.itinerary.dutyType)}
                    </span>
                  )}
                  {it.vehicle.packages?.[0] && (
                    <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-white/70">
                      {displayPackageSummary(it.vehicle.packages[0])}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => removeItem(it.id)}
                    className="lux-control text-xs px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-white/60 text-sm mt-8">
              Your cart is empty
            </p>
          )}
        </div>

        {/* Footer (sticky) */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              onClick={() => {
                setView({ name: "fleet" });
                closeCart();
              }}
              className="w-full py-3 rounded-xl bg-white text-black font-medium"
            >
              Proceed
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

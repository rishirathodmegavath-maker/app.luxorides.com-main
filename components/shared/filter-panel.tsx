"use client";

import React from "react";
import { X } from "lucide-react";

type FilterPanelProps = {
  locations?: readonly string[];
  brands?: string[];
  categories?: string[];

  selectedLocation?: string;
  setSelectedLocation?: (v: string) => void;

  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;

  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;

  resetFilters: () => void;

  onClose?: () => void;
};

export function FilterPanel({
  locations = [],
  brands = [],
  categories = [],

  selectedLocation,
  setSelectedLocation,

  selectedBrands,
  setSelectedBrands,

  selectedCategories,
  setSelectedCategories,

  resetFilters,
  onClose,
}: FilterPanelProps) {
  const toggle = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
    onClose?.();
  };

  return (
    <div className="lux-panel p-4 rounded-2xl">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">Filters</h4>

        {onClose && (
          <button
            onClick={onClose}
            className="lux-control p-2 rounded-md"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ================= LOCATION ================= */}
      {locations.length > 0 && selectedLocation && setSelectedLocation && (
        <div className="mb-5">
          <p className="text-white/70 text-sm mb-2">City</p>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => {
                  setSelectedLocation(location);
                  onClose?.();
                }}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedLocation === location
                    ? "bg-white text-black"
                    : "lux-control text-white/80"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= BRANDS ================= */}
      {brands.length > 0 && (
        <div className="mb-5">
          <p className="text-white/70 text-sm mb-2">Brands</p>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => toggle(b, selectedBrands, setSelectedBrands)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedBrands.includes(b)
                    ? "bg-white text-black"
                    : "lux-control text-white/80"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= CATEGORIES ================= */}
      {categories.length > 0 && (
        <div className="mb-6">
          <p className="text-white/70 text-sm mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() =>
                  toggle(c, selectedCategories, setSelectedCategories)
                }
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategories.includes(c)
                    ? "bg-white text-black"
                    : "lux-control text-white/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= RESET ================= */}
      <button
        onClick={() => {
          resetFilters();
          onClose?.();
        }}
        className="lux-control w-full px-4 py-2 rounded-md transition"
      >
        Reset Filters
      </button>
    </div>
  );
}

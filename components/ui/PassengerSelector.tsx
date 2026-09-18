"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Users, X } from "lucide-react";

import { PassengerService } from "@/services/passenger.service";
import { displayName } from "@/lib/utils";
import { useClientAuth } from "../auth/ClientAuthContext";
import PassengerForm from "../client/PassengerForm";
import type { Passenger } from "@/types";

type Props = {
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
};

export default function PassengerSelector({
  value,
  onChange,
  placeholder = "Add passengers",
}: Props) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { client, setClient } = useClientAuth();

  /*
   * P1.3 -- passengers now come straight from ClientAuthContext instead of
   * this component's own GET /client/app/passengers fetch. The backend
   * endpoint (PassengerController.list) literally returns
   * client.getPassengers() -- the exact same field already loaded into
   * `client` at login and kept in sync by every add/update/delete mutation
   * (see PassengerView, and addNewPassenger below) -- so the independent
   * fetch was downloading data already sitting in context, with no
   * different filter/pagination/freshness semantics of its own.
   */
  const passengers = useMemo(() => client?.passengers ?? [], [client]);

  /* ================= DERIVED ================= */

  const selectedPassengers = useMemo(
    () => passengers.filter((p) => value.includes(p.id)),
    [passengers, value]
  );

  const filteredPassengers = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return passengers.filter(
      (p) =>
        !value.includes(p.id) &&
        (displayName(p.name).toLowerCase().includes(q) ||
          (p.phone && p.phone.includes(q)))
    );
  }, [passengers, query, value]);

  const passengerFormInitialValues = useMemo<Passenger>(() => {
    const trimmedQuery = query.trim();
    const digits = trimmedQuery.replace(/\D/g, "");

    return {
      id: "",
      name: {
        salutation: "Mr.",
        firstName: digits ? "" : trimmedQuery,
        lastName: "",
      },
      phone: digits ? `+91${digits}` : "",
      email: "",
    };
  }, [query]);

  /* ================= ACTIONS ================= */

  const addPassenger = (id: string) => {
    onChange([...value, id]);
    setQuery("");
  };

  const removePassenger = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  const openAddPassengerForm = () => {
    setAdding(true);
  };

  const closeAddPassengerForm = () => {
    if (saving) return;
    setAdding(false);
  };

  const addNewPassenger = async (values: Passenger) => {
    if (saving) return;

    try {
      setSaving(true);
      const updatedClient = await PassengerService.add(values);

      setClient(updatedClient);
      const refreshedPassengers = updatedClient.passengers ?? [];

      const created = refreshedPassengers.find(
        (p) =>
          p.phone === values.phone ||
          (displayName(p.name)
            .toLowerCase()
            .includes(values.name.firstName.toLowerCase()) &&
            p.phone.endsWith(values.phone.replace(/\D/g, "").slice(-10))),
      );

      if (created && !value.includes(created.id)) {
        onChange([...value, created.id]);
      }

      setAdding(false);
      setQuery("");
    } finally {
      setSaving(false);
    }
  };

  const addPassengerPopup =
    adding && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="lux-modal-backdrop fixed inset-0 z-[90]"
              onClick={closeAddPassengerForm}
            />

            <div
              role="dialog"
              aria-modal="true"
              className="
                fixed left-1/2 top-1/2 z-[100]
                w-[calc(100vw-32px)] max-w-[420px]
                max-h-[calc(100dvh-32px)] overflow-y-auto
                -translate-x-1/2 -translate-y-1/2

                rounded-[28px]
                lux-panel
                p-5 pb-[calc(20px+env(safe-area-inset-bottom))]
                shadow-[0_30px_90px_rgba(0,0,0,0.38)]
              "
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Passenger
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Add new passenger
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeAddPassengerForm}
                  className="lux-control flex h-10 w-10 items-center justify-center rounded-full text-white transition"
                  aria-label="Close add passenger"
                >
                  <X size={18} />
                </button>
              </div>

              <PassengerForm
                initialValues={passengerFormInitialValues}
                submitLabel={saving ? "Saving..." : "Add Passenger"}
                onSubmit={addNewPassenger}
                onCancel={closeAddPassengerForm}
              />
            </div>
          </>,
          document.body,
        )
      : null;

  /* ================= RENDER ================= */

  return (
    <div ref={containerRef} className="space-y-3">
      {/* ================= SELECTED ================= */}
      {selectedPassengers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPassengers.map((p) => (
            <div
              key={p.id}
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-lg
                bg-neutral-100
                border border-neutral-200
                text-sm text-neutral-800
              "
            >
              <span className="font-medium">
                {displayName(p.name)}
              </span>

              {p.phone && (
                <span className="text-xs text-neutral-500">
                  • {p.phone}
                </span>
              )}

              <button
                onClick={() => removePassenger(p.id)}
                className="
                  ml-1
                  text-neutral-400 hover:text-neutral-700
                  transition
                "
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= INPUT ================= */}
      <div className="relative w-full">
        <Users
          size={18}
          className="
            pointer-events-none
            absolute left-4 top-1/2 -translate-y-1/2
            text-neutral-400
          "
        />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-14
            pl-12 pr-4
            rounded-xl
            border border-neutral-200
            bg-neutral-50
            text-sm text-neutral-900
            placeholder:text-neutral-400

            transition-all duration-200
            shadow-sm

            focus:outline-none
            focus:bg-white
            focus:border-neutral-300
            focus:ring-4 focus:ring-black/5
          "
        />
      </div>

      {/* ================= DROPDOWN ================= */}
      {(query || passengers.length === 0) && (
        <div
          className="
            relative z-20
            max-h-56 overflow-auto
            rounded-xl
            border border-neutral-200
            bg-white
            shadow-lg
          "
        >
          {!adding && filteredPassengers.length === 0 && (
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-neutral-500">
                {passengers.length === 0
                  ? "No passengers added yet"
                  : "No matching passengers"}
              </p>
              <button
                type="button"
                onClick={openAddPassengerForm}
                className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Add new passenger
              </button>
            </div>
          )}

          {!adding &&
            filteredPassengers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addPassenger(p.id)}
                className="
                  w-full px-4 py-3 text-left
                  hover:bg-neutral-50
                  transition
                "
              >
                <div className="text-sm font-medium text-neutral-900">
                  {displayName(p.name)}
                </div>
                {p.phone && (
                  <div className="text-xs text-neutral-500">{p.phone}</div>
                )}
              </button>
            ))}
        </div>
      )}

      {addPassengerPopup}
    </div>
  );
}

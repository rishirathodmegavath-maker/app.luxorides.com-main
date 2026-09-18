"use client";

import { useMemo, useState } from "react";
import { Building2, X } from "lucide-react";

import { displayAddress } from "@/lib/utils";
import { useClientAuth } from "../auth/ClientAuthContext";
import type { ClientBillingEntity } from "@/types";

type Props = {
  value?: string;
  onChange: (id?: string) => void;
  placeholder?: string;
};

export default function BillingEntitySelector({
  value,
  onChange,
  placeholder = "Select corporate account",
}: Props) {
  const [query, setQuery] = useState("");
  const { client } = useClientAuth();

  /*
   * P1.3 -- corporate billing entities now come straight from
   * ClientAuthContext instead of this component's own
   * GET /client/app/billing-entities fetch. The backend endpoint
   * (BillingEntityController.list) literally returns
   * client.getClientBillingEntity() -- the exact same field already
   * loaded into `client` at login and kept in sync by attach/detach (see
   * BillingEntityView) -- so the independent fetch was downloading data
   * already sitting in context.
   */
  const entities = useMemo(() => client?.clientBillingEntity ?? [], [client]);

  /* ================= DERIVED ================= */

  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === value),
    [entities, value]
  );

  const filteredEntities = useMemo(() => {
    if (!query) return [];

    const q = query.toLowerCase().trim();

    return entities.filter(
      (e) =>
        e.id !== value &&
        (e.legalName.toLowerCase().includes(q) ||
          e.gstin.toLowerCase().includes(q))
    );
  }, [entities, query, value]);

  /* ================= ACTIONS ================= */

  const selectEntity = (entity: ClientBillingEntity) => {
    onChange(entity.id);
    setQuery("");
  };

  const clearSelection = () => {
    onChange(undefined);
    setQuery("");
  };

  /* ================= DISPLAY VALUE ================= */

  const displayValue = selectedEntity
    ? `${selectedEntity.legalName} • ${selectedEntity.gstin}`
    : query;

  /* ================= RENDER ================= */

  return (
    <div className="space-y-3">
      {/* ================= INPUT ================= */}
      <div className="relative w-full">
        <Building2
          size={18}
          className="
            pointer-events-none
            absolute left-4 top-1/2 -translate-y-1/2
            text-neutral-400
          "
        />

        {selectedEntity && (
          <button
            type="button"
            onClick={clearSelection}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-neutral-400 hover:text-neutral-700
              transition
            "
          >
            <X size={16} />
          </button>
        )}

        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            if (selectedEntity) clearSelection();
            setQuery(e.target.value);
          }}
          placeholder={placeholder}
          className="
            w-full h-14
            pl-12 pr-10
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
      {!selectedEntity && query && (
        <div
          className="
            relative z-20
            max-h-60 overflow-auto
            rounded-xl
            border border-neutral-200
            bg-white
            shadow-lg
          "
        >
          {filteredEntities.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-500">
              No matching accounts
            </div>
          )}

          {filteredEntities.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEntity(e)}
              className="
                w-full px-4 py-3 text-left
                hover:bg-neutral-50
                transition
              "
            >
              <div className="text-sm font-medium text-neutral-900">
                {e.legalName}
              </div>

              <div className="text-xs text-neutral-500">
                {e.gstin}
              </div>

              <div className="text-xs text-neutral-400 mt-0.5">
                {displayAddress(e.address)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
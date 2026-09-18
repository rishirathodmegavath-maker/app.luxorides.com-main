"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash } from "lucide-react";
import { useState } from "react";

import { useView } from "./ViewContext";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import { ClientBillingEntityService } from "@/services/client-billing-entity.service";
import { ClientBillingEntity } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { displayAddress } from "@/lib/utils";

export default function BillingEntityView() {
  const { setView } = useView();
  const { client, setClient } = useClientAuth();

  const [adding, setAdding] = useState(false);
  const [gstin, setGstin] = useState("");
  const [lookupResult, setLookupResult] =
    useState<ClientBillingEntity | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ClientBillingEntity | null>(null);
  /*
   * P1.8 -- handleLookup/handleAttach/handleDetach had no in-flight guard, so
   * a fast double-click on "Fetch Details"/"Attach to Account"/"Detach" fired
   * duplicate requests. Lookup and attach never overlap in time with detach
   * (different view states -- adding vs. the list), so one shared flag is
   * enough, same pattern as the chauffeur app's Button.tsx isDisabled.
   */
  const [submitting, setSubmitting] = useState(false);

  if (!client) return null;

  /*
   * P1.3 -- entities come straight from ClientAuthContext (see
   * BillingEntitySelector for the same reasoning) instead of this view's
   * own GET /client/app/billing-entities fetch on mount.
   */
  const entities = client.clientBillingEntity ?? [];

  /* ================= HANDLERS ================= */

  const handleLookup = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await ClientBillingEntityService.getByGstin(gstin);
      setLookupResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttach = async () => {
    if (submitting || !lookupResult) return;
    setSubmitting(true);
    try {
      const updatedClient =
        await ClientBillingEntityService.attach(lookupResult.id);

      setClient(updatedClient);

      setLookupResult(null);
      setGstin("");
      setAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetach = async () => {
    if (submitting || !deleteTarget) return;
    setSubmitting(true);
    try {
      const updatedClient =
        await ClientBillingEntityService.detach(deleteTarget.id);

      setClient(updatedClient);
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-screen space-y-6"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView({ name: "account" })}
            className="lux-control p-2 rounded-full transition"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold">Corporate Accounts</h2>
        </div>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="lux-control p-2 rounded-full transition"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* ================= ADD BY GSTIN ================= */}
      {adding && (
        <div className="lux-card rounded-[28px] p-5 sm:p-6 space-y-4">
          <h3 className="font-medium">Add Corporate Account</h3>

          <input
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="Enter GSTIN"
            className="lux-input-dark h-[52px] w-full rounded-2xl px-4 outline-none focus:border-[#d8b25c]/60"
          />

          {!lookupResult && (
            <button
              onClick={handleLookup}
              disabled={submitting}
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/85 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fetch Details
            </button>
          )}

          {lookupResult && (
            <div className="lux-panel rounded-[22px] p-4 space-y-2">
              <p className="font-medium">{lookupResult.legalName}</p>
              <p className="text-xs text-white/60">{lookupResult.gstin}</p>
              <p className="text-xs text-white/50">
                {displayAddress(lookupResult.address)}
              </p>

              <button
                onClick={handleAttach}
                disabled={submitting}
                className="mt-2 w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/85 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Attach to Account
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setAdding(false);
              setLookupResult(null);
              setGstin("");
            }}
            className="w-full text-sm text-white/60"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ================= LIST ================= */}
      {!adding && (
        <div className="space-y-3">
          {entities.length === 0 && (
            <p className="text-white/60 text-sm">
              No corporate accounts attached.
            </p>
          )}

          {entities.map((e) => (
            <div
              key={e.id}
              className="
                lux-card
                rounded-[24px]
                p-4 flex items-center justify-between
              "
            >
              <div>
                <p className="font-medium">{e.legalName}</p>
                <p className="text-xs text-white/60">{e.gstin}</p>
                <p className="text-xs text-white/50">
                  {displayAddress(e.address)}
                </p>
              </div>

              <button
                onClick={() => setDeleteTarget(e)}
                className="p-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= CONFIRM DETACH ================= */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Detach corporate account?"
        description={`This will remove ${
          deleteTarget?.legalName ?? "this entity"
        } from your profile.`}
        confirmText="Detach"
        danger
        confirmDisabled={submitting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDetach}
      />
    </motion.section>
  );
}

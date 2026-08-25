"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { useView } from "./ViewContext";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import { ClientBillingEntityService } from "@/services/client-billing-entity.service";
import { ClientBillingEntity } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { displayAddress } from "@/lib/utils";

export default function BillingEntityView() {
  const { setView } = useView();
  const { client, setClient } = useClientAuth();

  const [entities, setEntities] = useState<ClientBillingEntity[]>([]);
  const [adding, setAdding] = useState(false);
  const [gstin, setGstin] = useState("");
  const [lookupResult, setLookupResult] =
    useState<ClientBillingEntity | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ClientBillingEntity | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    ClientBillingEntityService.list().then(setEntities);
  }, []);

  if (!client) return null;

  /* ================= HANDLERS ================= */

  const handleLookup = async () => {
    const res = await ClientBillingEntityService.getByGstin(gstin);
    setLookupResult(res);
  };

  const handleAttach = async () => {
    if (!lookupResult) return;

    const updatedClient =
      await ClientBillingEntityService.attach(lookupResult.id);

    setClient(updatedClient);
    setEntities(updatedClient.clientBillingEntity || []);

    setLookupResult(null);
    setGstin("");
    setAdding(false);
  };

  const handleDetach = async () => {
    if (!deleteTarget) return;

    const updatedClient =
      await ClientBillingEntityService.detach(deleteTarget.id);

    setClient(updatedClient);
    setEntities(updatedClient.clientBillingEntity || []);
    setDeleteTarget(null);
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
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/85"
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
                className="mt-2 w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/85"
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
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDetach}
      />
    </motion.section>
  );
}

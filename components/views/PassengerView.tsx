"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Plus, Pencil, Trash } from "lucide-react";
import { useState } from "react";

import { useView } from "./ViewContext";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import { PassengerService } from "@/services/passenger.service";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Passenger } from "@/types";
import { displayName } from "@/lib/utils";
import PassengerForm from "../client/PassengerForm";

export default function PassengerView() {
  const { setView } = useView();
  const { client, setClient } = useClientAuth();

  const [adding, setAdding] = useState(false);
  const [editingPassenger, setEditingPassenger] =
    useState<Passenger | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Passenger | null>(null);

  if (!client) return null;

  const passengers = client.passengers ?? [];

  /* ================= ADD ================= */

  const handleAdd = async (values: Passenger) => {
    const updatedClient = await PassengerService.add(values);
    setClient(updatedClient);
    setAdding(false);
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async (
    passengerId: string,
    values: Passenger
  ) => {
    const updatedClient = await PassengerService.update(
      passengerId,
      values
    );
    setClient(updatedClient);
    setEditingPassenger(null);
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    await PassengerService.delete(deleteTarget.id);

    const refreshedPassengers = await PassengerService.list();

    setClient({
      ...client,
      passengers: refreshedPassengers,
    });

    setDeleteTarget(null);
  };

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
            onClick={() => setView({name:"account"})}
            className="lux-control p-2 rounded-full transition"
          >
            <ChevronLeft size={18} />
          </button>

          <h2 className="text-lg font-semibold">Frequent Travellers</h2>
        </div>

        {!adding && !editingPassenger && (
          <button
            onClick={() => setAdding(true)}
            className="lux-control p-2 rounded-full transition"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* ================= ADD FORM ================= */}
      {adding && (
        <div className="lux-card rounded-[28px] p-5 sm:p-6">
          <h3 className="font-medium mb-3">Add Passenger</h3>

          <PassengerForm
            submitLabel="Add Passenger"
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {/* ================= EDIT FORM ================= */}
      {editingPassenger && (
        <div className="lux-card rounded-[28px] p-5 sm:p-6">
          <h3 className="font-medium mb-3">Edit Passenger</h3>

          <PassengerForm
            initialValues={editingPassenger}
            submitLabel="Update Passenger"
            onSubmit={(values) =>
              handleUpdate(editingPassenger.id, values)
            }
            onCancel={() => setEditingPassenger(null)}
          />
        </div>
      )}

      {/* ================= LIST ================= */}
      {!adding && !editingPassenger && (
        <div className="space-y-3">
          {passengers.length === 0 && (
            <p className="text-white/60 text-sm">
              No passengers added yet.
            </p>
          )}

          {passengers.map((p) => (
            <div
              key={p.id}
              className="
                lux-card
                rounded-[24px]
                p-4 flex items-center justify-between
              "
            >
              <div>
                <p className="font-medium">{displayName(p.name)}</p>
                <p className="text-xs text-white/60">{p.phone}</p>
                {p.email && (
                  <p className="text-xs text-white/50">{p.email}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPassenger(p)}
                  className="lux-control p-2 rounded-full"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CONFIRM DELETE ================= */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove passenger?"
        description={`This will permanently remove ${
          deleteTarget?.name ?? "this passenger"
        } from your account.`}
        confirmText="Remove"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </motion.section>
  );
}

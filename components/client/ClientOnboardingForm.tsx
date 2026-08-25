"use client";

import { useState } from "react";
import { Client } from "@/types/client";
import { Button } from "../ui/button";

/* ================= TYPES ================= */

export type ClientProfileFormValues = {
  name: {
    salutation: string;
    firstName: string;
    lastName?: string;
  };
  email?: string | null;
};

/* ================= COMPONENT ================= */

export default function ClientOnboardingForm({
  client,
  onSubmit,
}: {
  client: Client;
  onSubmit: (values: ClientProfileFormValues) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<ClientProfileFormValues>({
    name: {
      salutation: client.name?.salutation ?? "",
      firstName: client.name?.firstName ?? "",
      lastName: client.name?.lastName ?? "",
    },
    email: client.email ?? "",
  });

  /* ================= HELPERS ================= */

  const updateName = (
    key: keyof ClientProfileFormValues["name"],
    value: string,
  ) =>
    setForm((p) => ({
      ...p,
      name: { ...p.name, [key]: value },
    }));

  const canProceedFromStep1 =
    !!form.name.salutation && form.name.firstName.trim().length > 0;

  const canSubmit =
    form.email?.length === 0 || /\S+@\S+\.\S+/.test(form.email ?? "");

  /* ================= SHARED INPUT ================= */

  const glassInput =
    "lux-input-dark mt-1 w-full h-11 px-4 rounded-xl placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30";

  /* ================= RENDER ================= */

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 2 && canSubmit) onSubmit(form);
      }}
      className="space-y-6"
    >
      {/* ================= STEP 1: NAME ================= */}
      {step === 1 && (
        <>
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-white">
              Let’s get started
            </h2>
            <p className="text-sm text-white/60">
              Tell us how we should address you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Salutation */}
            <div>
              <label className="text-sm text-white/70">Title</label>
              <select
                value={form.name.salutation}
                onChange={(e) => updateName("salutation", e.target.value)}
                required
                className={glassInput}
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-neutral-900 text-white">
                  Select
                </option>
                <option value="Mr." className="bg-neutral-900 text-white">
                  Mr.
                </option>
                <option value="Ms." className="bg-neutral-900 text-white">
                  Ms.
                </option>
                <option value="Mrs." className="bg-neutral-900 text-white">
                  Mrs.
                </option>
                <option value="Dr." className="bg-neutral-900 text-white">
                  Dr.
                </option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="text-sm text-white/70">First Name</label>
              <input
                value={form.name.firstName}
                onChange={(e) => updateName("firstName", e.target.value)}
                required
                className={glassInput}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm text-white/70">Last Name</label>
              <input
                value={form.name.lastName ?? ""}
                onChange={(e) => updateName("lastName", e.target.value)}
                className={glassInput}
              />
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="glass"
            size="default"
            className="w-full"
            onClick={() => setStep(2)}
            disabled={!canProceedFromStep1}
          >
            Continue
          </Button>
        </>
      )}

      {/* ================= STEP 2: EMAIL ================= */}
      {step === 2 && (
        <>
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-white">
              Almost done
            </h2>
            <p className="text-sm text-white/60">
              Add an email for updates
            </p>
          </div>

          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  email: e.target.value,
                }))
              }
              className={glassInput}
            />
          </div>

          {/* CTA ROW */}
          <div className="flex gap-3">
            <Button
              variant="glass-outline"
              size="default"
              className="flex-1"
              type="button"
              onClick={() => setStep(1)}
            >
              Back
            </Button>

            <Button
              variant="glass"
              size="default"
              className="flex-1"
              type="submit"
              disabled={!canSubmit}
            >
              Finish
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

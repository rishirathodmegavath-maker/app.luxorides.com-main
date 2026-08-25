"use client";

import { useEffect, useState } from "react";
import { Client } from "@/types/client";
import { ClientProfileService } from "@/services/client-profile.service";
import ClientOnboardingForm, {
  ClientProfileFormValues,
} from "@/components/client/ClientOnboardingForm";

export default function ProfileSetupStep({
  onComplete,
}: {
  onComplete: (client: Client) => void;
}) {
  const [client, setClient] = useState<Client | null>(null);
  const [checking, setChecking] = useState(true);

  /* ================= FETCH CLIENT ================= */

  useEffect(() => {
    ClientProfileService.me()
      .then((c) => {
        setClient(c);

        // If email already exists, skip onboarding entirely
        if (c.email) {
          onComplete(c);
        }
      })
      .finally(() => setChecking(false));
  }, [onComplete]);

  if (checking || !client) return null;

  /* ================= SUBMIT ================= */

  const handleSubmit = async (values: ClientProfileFormValues) => {
    const updatedClient = await ClientProfileService.updateProfile(values);
    onComplete(updatedClient);
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-5">

      <ClientOnboardingForm client={client} onSubmit={handleSubmit} />
    </div>
  );
}

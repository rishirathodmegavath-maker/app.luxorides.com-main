"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Client } from "@/types/client";
import { ClientProfileService } from "@/services/client-profile.service";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import { Camera } from "lucide-react";
import { getFileUrl } from "@/utils/file-url";

/* =====================================================
   FORM VALUES (MATCHES UPDATED BACKEND)
   ===================================================== */

export type ClientProfileFormValues = {
  name: {
    salutation: string;
    firstName: string;
    lastName?: string;
  };
  email?: string | null;
  address?: {
    formattedAddress: string;
    city: string;
    state: string;
    pincode: string;
    countryCode: string;
  } | null;
  profilePic?: string | null;
};

export default function ClientProfileForm({
  client,
  submitLabel = "Save",
  showSkip = false,
  onSubmit,
  onSkip,
}: {
  client: Client;
  submitLabel?: string;
  showSkip?: boolean;
  onSubmit: (values: ClientProfileFormValues) => void;
  onSkip?: () => void;
}) {
  const { setClient } = useClientAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= STATE ================= */

  const [form, setForm] = useState<ClientProfileFormValues>({
    name: {
      salutation: client.name?.salutation ?? "",
      firstName: client.name?.firstName ?? "",
      lastName: client.name?.lastName ?? "",
    },
    email: client.email ?? "",
    address: client.address
      ? { ...client.address }
      : {
          formattedAddress: "",
          city: "",
          state: "",
          pincode: "",
          countryCode: "IN",
        },
    profilePic: client.pic ?? "",
  });

  const [uploading, setUploading] = useState(false);
  const [imageCacheKey, setImageCacheKey] = useState<string | null>(
    client.updatedAt ?? null,
  );

  /* ================= HANDLERS ================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const updateName = (key: keyof ClientProfileFormValues["name"], value: string) =>
    setForm((p) => ({
      ...p,
      name: { ...p.name, [key]: value },
    }));

  const updateAddress = (
    key: keyof NonNullable<ClientProfileFormValues["address"]>,
    value: string
  ) =>
    setForm((p) => ({
      ...p,
      address: p.address
        ? { ...p.address, [key]: value }
        : p.address,
    }));

  /* ================= IMAGE UPLOAD ================= */

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setForm((p) => ({ ...p, profilePic: previewUrl }));

    try {
      setUploading(true);
      const updatedClient =
        await ClientProfileService.updateProfileImage(file);

      setClient(updatedClient);
      setImageCacheKey(updatedClient.updatedAt ?? Date.now().toString());

      setForm((p) => ({
        ...p,
        profilePic: updatedClient.pic ?? previewUrl,
      }));
    } finally {
      setUploading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ================= AVATAR ================= */}
      <div className="flex justify-center">
        <div className="relative h-24 w-24 rounded-full overflow-hidden group">
          <Image
            src={getFileUrl(form.profilePic, imageCacheKey) || "/user.png"}
            alt="Profile"
            fill
            unoptimized
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
          >
            <Camera size={20} className="text-white" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelect}
        />
      </div>

      {uploading && (
        <p className="text-xs text-center text-white/60">Uploading image…</p>
      )}

      {/* ================= NAME ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-white/70">Title</label>
          <select
            value={form.name.salutation}
            onChange={(e) => updateName("salutation", e.target.value)}
            className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
            required
          >
            <option value="">Select</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-white/70">First Name</label>
          <input
            value={form.name.firstName}
            onChange={(e) => updateName("firstName", e.target.value)}
            className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-sm text-white/70">Last Name</label>
          <input
            value={form.name.lastName ?? ""}
            onChange={(e) => updateName("lastName", e.target.value)}
            className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
          />
        </div>
      </div>

      {/* ================= PHONE ================= */}
      <div>
        <label className="text-sm text-white/70">Mobile Number</label>
        <input
          value={client.phone}
          disabled
          className="mt-1 w-full px-4 py-2 rounded-xl border border-white/10 bg-[#111114] text-white/60 cursor-not-allowed"
        />
      </div>

      {/* ================= EMAIL ================= */}
      <div>
        <label className="text-sm text-white/70">Email (optional)</label>
        <input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="lux-input-dark mt-1 w-full px-4 py-2 rounded-xl"
        />
      </div>

      {/* ================= ADDRESS ================= */}
      <div className="space-y-2">
        <label className="text-sm text-white/70">Address</label>

        <textarea
          rows={2}
          placeholder="Full address"
          value={form.address?.formattedAddress ?? ""}
          onChange={(e) =>
            updateAddress("formattedAddress", e.target.value)
          }
          className="lux-input-dark w-full px-4 py-2 rounded-xl"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="City"
            value={form.address?.city ?? ""}
            onChange={(e) => updateAddress("city", e.target.value)}
            className="lux-input-dark px-4 py-2 rounded-xl"
          />

          <input
            placeholder="State"
            value={form.address?.state ?? ""}
            onChange={(e) => updateAddress("state", e.target.value)}
            className="lux-input-dark px-4 py-2 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Pincode"
            value={form.address?.pincode ?? ""}
            onChange={(e) => updateAddress("pincode", e.target.value)}
            className="lux-input-dark px-4 py-2 rounded-xl"
          />

          <input
            placeholder="Country Code"
            value={form.address?.countryCode ?? ""}
            onChange={(e) => updateAddress("countryCode", e.target.value)}
            className="lux-input-dark px-4 py-2 rounded-xl"
          />
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 font-medium transition"
      >
        {submitLabel}
      </button>

      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-sm text-white/60"
        >
          Skip for now
        </button>
      )}
    </form>
  );
}

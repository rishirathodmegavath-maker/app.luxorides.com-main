"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  LucideIcon,
  Pencil,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { useClientAuth } from "@/components/auth/ClientAuthContext";
import ClientProfileForm from "@/components/client/ClientProfileForm";
import { useState } from "react";
import { ClientProfileService } from "@/services/client-profile.service";
import { getFileUrl } from "@/utils/file-url";
import { useView } from "./ViewContext";
import { displayAddress, displayName } from "@/lib/utils";

export default function AccountView() {
  const { client, logout, loading, setClient } = useClientAuth();
  const [editing, setEditing] = useState(false);
  const { setView } = useView();

  if (loading) {
    return <div className="p-6 text-white/60">Loading profile…</div>;
  }

  if (!client) {
    return null; // AuthGate handles redirect
  }

  return (
    <section className="app-screen space-y-6">
      {/* ================= PROFILE CARD ================= */}
      {!editing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="
          lux-card
          relative flex flex-col sm:flex-row items-center sm:items-start gap-5
          rounded-[28px]
          p-5 sm:p-6
        "
        >
          {/* Mobile Edit Button */}
          <button
            onClick={() => setEditing(true)}
            className="
            absolute top-4 right-4
            sm:hidden
            p-2 rounded-full
            lux-control
            transition
          "
            aria-label="Edit profile"
          >
            <Pencil size={16} />
          </button>

          {/* Avatar */}
          <div className="relative h-24 w-24 rounded-full overflow-hidden shrink-0">
            <Image
              src={getFileUrl(client.pic, client.updatedAt) || "/user.png"}
              alt="Client profile"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {displayName(client.name)}
            </h2>

            {/* Phone (always present) */}
            <p className="text-sm text-white/70">{client.phone}</p>

            {/* Email (optional) */}
            {client.email && (
              <p className="text-sm text-white/70">{client.email}</p>
            )}

            {/* Address (optional) */}
            {client.address && (
              <p className="text-xs text-white/60">
                {displayAddress(client.address)}
              </p>
            )}

            {/* Created At (optional) */}
            {client.createdAt && (
              <p className="text-xs text-white/50">
                Member since {new Date(client.createdAt).getFullYear()}
              </p>
            )}
          </div>

          {/* Desktop Edit Button */}
          <div className="hidden sm:block">
            <button
              onClick={() => setEditing(true)}
              className="
              px-4 py-2.5 text-sm rounded-full
              bg-white text-black hover:bg-white/85
              transition
            "
            >
              Edit Profile
            </button>
          </div>
        </motion.div>
      )}

      {/* ================= ACTION GRID ================= */}
      {!editing && (
        <div
          className="
          grid grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4 lg:gap-6
        "
        >
          <AccountAction
            icon={Users}
            title="Frequent Travellers"
            description="Save passenger profiles for faster reservations"
            onClick={() => setView({ name: "passengers" })}
          />

          <AccountAction
            icon={Building2}
            title="Corporate Accounts"
            description="Billing preferences, travellers & policies"
            onClick={() => setView({ name: "corporates" })}
          />

          <AccountAction
            icon={Settings}
            title="Policies & Legal"
            description="Terms, privacy and cancellation policies"
            onClick={() => setView({ name: "policies" })}
          />

          <AccountAction
            icon={MessageCircle}
            title="Support"
            description="Raise a ticket and chat with our team"
            onClick={() => setView({ name: "support" })}
          />

          <AccountAction
            icon={HelpCircle}
            title="FAQs"
            description="Answers to common questions"
            onClick={() => setView({ name: "faq" })}
          />

          <AccountAction
            icon={LogOut}
            title="Logout"
            description="Sign out from this device"
            danger
            onClick={logout}
          />
        </div>
      )}
      {/* ================= PROFILE FORM ================= */}
      {editing && (
        <div className="lux-card rounded-[28px] p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

          <ClientProfileForm
            client={client}
            submitLabel="Save Changes"
            onSubmit={async (values) => {
              const { profilePic, ...profilePayload } = values;
              const updated =
                await ClientProfileService.updateProfile(profilePayload);
              const uploadedPic =
                profilePic && !profilePic.startsWith("blob:")
                  ? profilePic
                  : null;

              setClient({
                ...updated,
                pic: uploadedPic ?? updated.pic ?? client.pic,
                updatedAt: new Date().toISOString(),
              });
              setEditing(false);
            }}
          />
        </div>
      )}
    </section>
  );
}

function AccountAction({
  icon: Icon,
  title,
  description,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`
        group w-full text-left
        lux-card
        rounded-[24px]
        p-5
        flex items-center gap-4
        transition
        hover:bg-[#202024]
        ${danger ? "hover:border-rose-400/40" : ""}
      `}
    >
      <div
        className={`
          h-11 w-11 rounded-xl flex items-center justify-center
          ${danger ? "bg-rose-950/80" : "bg-[#24242a]"}
        `}
      >
        <Icon size={20} className={danger ? "text-rose-200" : "text-white"} />
      </div>

      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-white/60">{description}</p>
      </div>

      <ChevronRight
        size={18}
        className="text-white/40 group-hover:text-white/70 transition"
      />
    </motion.button>
  );
}

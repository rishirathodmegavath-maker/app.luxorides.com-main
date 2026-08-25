import { privateApi } from "./api.private";
import { Client, ClientProfileUpdateRequest } from "@/types/client";

export const ClientProfileService = {
  /* ================= FETCH SELF ================= */

  me(): Promise<Client> {
    return privateApi<Client>("/client/app/profile/me");
  },

  /* ================= UPDATE PROFILE INFO ================= */

  updateProfile(payload: ClientProfileUpdateRequest): Promise<Client> {
    return privateApi<Client>("/client/app/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /* ================= UPDATE PROFILE IMAGE ================= */

  async updateProfileImage(file: File): Promise<Client> {
    const formData = new FormData();
    formData.append("file", file);

    const uploaded = await privateApi<Partial<Client> | { pic?: string } | string>(
      "/client/app/profile/image",
      {
        method: "POST",
        body: formData,
      },
    );

    const freshClient = await ClientProfileService.me();
    const cacheStampedClient = {
      ...freshClient,
      updatedAt: new Date().toISOString(),
    };

    if (typeof uploaded === "string") {
      return { ...cacheStampedClient, pic: uploaded };
    }

    if (uploaded && typeof uploaded === "object" && "pic" in uploaded) {
      return {
        ...cacheStampedClient,
        pic: uploaded.pic ?? freshClient.pic,
      };
    }

    return cacheStampedClient;
  },
};

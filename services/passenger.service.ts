import { privateApi } from "./api.private";
import { Passenger, Client } from "@/types";

/* ================= PASSENGER SERVICE ================= */

export const PassengerService = {
  /* ================= FETCH LIST ================= */

  list(): Promise<Passenger[]> {
    return privateApi<Passenger[]>("/client/app/passengers");
  },

  /* ================= ADD ================= */

  add(payload: Omit<Passenger, "passengerId" | "clientId">): Promise<Client> {
    return privateApi<Client>("/client/app/passengers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /* ================= UPDATE ================= */

  update(
    passengerId: string,
    payload: Omit<Passenger, "passengerId" | "clientId">
  ): Promise<Client> {
    return privateApi<Client>(`/client/app/passengers/${passengerId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /* ================= DELETE ================= */

  delete(passengerId: string): Promise<void> {
    return privateApi<void>(`/client/app/passengers/${passengerId}`, {
      method: "DELETE",
    });
  },
};

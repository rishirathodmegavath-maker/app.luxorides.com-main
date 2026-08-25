import { privateApi } from "./api.private";
import { Client, ClientBillingEntity } from "@/types";

/* ================= BILLING ENTITY SERVICE ================= */

export const ClientBillingEntityService = {
  list(): Promise<ClientBillingEntity[]> {
    return privateApi("/client/app/billing-entities");
  },

  getByGstin(gstin: string): Promise<ClientBillingEntity> {
    return privateApi(
      `/client/app/billing-entities/by-gstin/${gstin}`
    );
  },

  attach(billingEntityId: string): Promise<Client> {
    return privateApi(
      `/client/app/billing-entities/${billingEntityId}/attach`,
      { method: "POST" }
    );
  },

  detach(billingEntityId: string): Promise<Client> {
    return privateApi(
      `/client/app/billing-entities/${billingEntityId}/detach`,
      { method: "DELETE" }
    );
  },
};

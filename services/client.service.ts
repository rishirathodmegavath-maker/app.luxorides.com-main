import { Client } from "@/types";
import { privateApi } from "./api.private";

export const ClientService = {
  me() {
    return privateApi<Client>("/auth/client/me");
  },
};

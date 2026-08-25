import {
  Client,
  ClientOtpRequest,
  ClientOtpResponse,
  ClientOtpVerifyRequest,
  LoginResponse,
} from "@/types";
import { publicApi } from "./api.public";

/* ================= SERVICE ================= */

const TOKEN_KEY = "fleetovo_client_token";

export const AuthService = {
  /* ================= OTP ================= */

  generateOtp(payload: Omit<ClientOtpRequest, "orgId">) {
    return publicApi<ClientOtpResponse, Omit<ClientOtpRequest, "orgId">>(
      "/auth/client/generate-otp",
      {
        method: "POST",
        body: payload,
      },
    );
  },

  verifyOtp(payload: Omit<ClientOtpVerifyRequest, "orgId">) {
    return publicApi<
      LoginResponse<Client>,
      Omit<ClientOtpVerifyRequest, "orgId">
    >("/auth/client/verify-otp", {
      method: "POST",
      body: payload,
    });
  },

  /* ================= LOGOUT ================= */

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

/* ================= OTP ================= */

export interface ClientOtpRequest {
  mobileNumber: string;
  orgId: string;
}

export interface ClientOtpVerifyRequest {
  mobileNumber: string;
  orgId: string;
  otp: string;
}

export interface ClientOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

/* ================= LOGIN ================= */

export interface LoginResponse<T> {
  token: string;
  expiresIn: number;
  user: T;
}

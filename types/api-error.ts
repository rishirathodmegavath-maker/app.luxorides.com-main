// types/api-error.ts
export interface ApiError {
  code: string;
  message: string;
  status: number;
  path: string;
  timestamp: string; // Instant → string
  metadata?: Record<string, unknown>;
}
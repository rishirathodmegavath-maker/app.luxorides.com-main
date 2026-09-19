const DEV_DEFAULT_BASE_URL = "http://localhost:8443";

// P0 -- the backend base URL used to be hardcoded to localhost:8443 here,
// which meant every production build (server-side API/file proxy routes AND
// the client-side WebSocket/trip-share code below, which all import BASE_URL
// from this single module) silently targeted a developer's own machine
// unless someone remembered to hand-edit this file before deploying. Now
// driven entirely by NEXT_PUBLIC_API_BASE_URL: real value in prod, the old
// localhost default preserved for local development (still explicit, never
// silent), and a loud failure -- not an accidental localhost fallback -- if
// production is ever built/run without it configured.
//
// NEXT_PUBLIC_ (not a server-only var) is required because BASE_URL is read
// from browser code too (useBookingRealtime/useDutyLocationRealtime open a
// WebSocket directly from the client, and the public trip-share page fetches
// the backend directly) -- Next.js only inlines NEXT_PUBLIC_-prefixed vars
// into the client bundle. This is genuinely public configuration (a
// customer-facing API's own hostname, not a secret), so exposing it to the
// browser is safe and unavoidable for those call sites.
function resolveBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Refusing to start in production " +
        "without an explicitly configured backend URL (see .env.example)."
    );
  }

  return DEV_DEFAULT_BASE_URL;
}

// P1.12 -- this key used to be hardcoded here directly (same fixed value
// also hardcoded in the fleetovo-app-main ops app), committed to source
// with no way to rotate or restrict it per-deployment, and flagged by
// GitHub secret scanning once pushed. A Google Maps JS key is
// browser-exposed by design either way (Google's actual protection for
// this key is HTTP-referrer + API restriction in Cloud Console, not
// secrecy), but a hardcoded value still can't be rotated without a code
// change and shouldn't live in source. Same fail-loudly pattern as
// BASE_URL above: no fallback key, ever.
function resolveGoogleMapsKey(): string {
  const configured = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set. Refusing to start in " +
        "production without an explicitly configured Google Maps key " +
        "(see .env.example)."
    );
  }

  throw new Error(
    "NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set. Set it in .env.local " +
      "(see .env.example)."
  );
}

export const CONFIG = {
  BASE_URL: resolveBaseUrl(),
  // demo is live on vercel and luxorides is live on VPS
  ORG_ID: "demo",
  GOOGLE_MAPS_KEY: resolveGoogleMapsKey(),
  CART_STORAGE_KEY:"luxorides_cart_v1"
};

// Derived from BASE_URL so the two can never drift out of sync when
// switching environments -- http(s) -> ws(s), same host. https:// correctly
// becomes wss:// (only the "http" prefix is replaced, leaving the "s").
export const WS_BASE_URL = CONFIG.BASE_URL.replace(/^http/, "ws");



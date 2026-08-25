export const CONFIG = {
  BASE_URL: "http://localhost:8443",
  // BASE_URL: "https://beta.fleetovo.com",
  // demo is live on vercel and luxorides is live on VPS
  ORG_ID: "demo",
  GOOGLE_MAPS_KEY:"AIzaSyB05ul7W1kSDwX-8Magxd2B2zkx4MRthCs",
  CART_STORAGE_KEY:"luxorides_cart_v1"
};

// Derived from BASE_URL so the two can never drift out of sync when
// switching between local/beta -- http(s) -> ws(s), same host.
export const WS_BASE_URL = CONFIG.BASE_URL.replace(/^http/, "ws");



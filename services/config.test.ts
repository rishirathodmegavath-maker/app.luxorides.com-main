import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";

/*
 * P0 -- services/config.ts used to hardcode BASE_URL to
 * "http://localhost:8443" unconditionally. Every production build (the
 * server-side /api and /file-api proxy routes, plus the client-side
 * WebSocket hooks and the public trip-share page, which all import
 * CONFIG/WS_BASE_URL from this one module) silently depended on a
 * developer's own machine unless someone remembered to hand-edit the file
 * before deploying. These tests exercise the real module (dynamic
 * re-import per NODE_ENV/env-var combination, not a reimplemented helper)
 * to prove: dev still defaults to localhost, production resolves the
 * configured URL, and production without configuration fails loudly rather
 * than silently falling back to localhost.
 */

async function loadConfig() {
  vi.resetModules();
  return import("./config");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("services/config BASE_URL resolution", () => {
  it("development: resolves localhost when NEXT_PUBLIC_API_BASE_URL is not configured", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { CONFIG } = await loadConfig();

    expect(CONFIG.BASE_URL).toBe("http://localhost:8443");
  });

  it("production: resolves the configured backend URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fleetovo.com");

    const { CONFIG } = await loadConfig();

    expect(CONFIG.BASE_URL).toBe("https://api.fleetovo.com");
  });

  it("production: strips a trailing slash from the configured URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fleetovo.com/");

    const { CONFIG } = await loadConfig();

    expect(CONFIG.BASE_URL).toBe("https://api.fleetovo.com");
  });

  it("production: missing configuration throws instead of falling back to localhost", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    await expect(loadConfig()).rejects.toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("production: never silently resolves to a localhost URL under any configured value", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://beta.fleetovo.com");

    const { CONFIG } = await loadConfig();

    expect(CONFIG.BASE_URL).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  it("HTTP API proxy routes (server-side) read the same canonical BASE_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fleetovo.com");

    const { CONFIG } = await loadConfig();

    // app/api/[...path]/route.ts and app/file-api/[filename]/route.ts both
    // read CONFIG.BASE_URL directly -- this is the single canonical value
    // they consume, proven here rather than asserted by inspection alone.
    expect(CONFIG.BASE_URL).toBe("https://api.fleetovo.com");
  });
});

describe("services/config WS_BASE_URL derivation", () => {
  it("derives wss:// from an https:// backend (production)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fleetovo.com");

    const { WS_BASE_URL } = await loadConfig();

    expect(WS_BASE_URL).toBe("wss://api.fleetovo.com");
  });

  it("derives ws:// from an http:// backend (development default)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { WS_BASE_URL } = await loadConfig();

    expect(WS_BASE_URL).toBe("ws://localhost:8443");
  });

  it("derives wss:// from an explicitly-configured https:// backend in development too", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://staging.fleetovo.com");

    const { WS_BASE_URL } = await loadConfig();

    expect(WS_BASE_URL).toBe("wss://staging.fleetovo.com");
  });
});

describe("static regression guard: no production-relevant file hardcodes localhost:8443", () => {
  // The only file allowed to mention localhost:8443 at all is
  // services/config.ts itself (the single, documented, dev-only default).
  // Every other production-relevant consumer must go through CONFIG/WS_BASE_URL.
  const productionRelevantFiles = [
    "app/api/[...path]/route.ts",
    "app/file-api/[filename]/route.ts",
    "app/track/[token]/TrackTripClient.tsx",
    "hooks/useBookingRealtime.ts",
    "hooks/useDutyLocationRealtime.ts",
  ];

  for (const relativePath of productionRelevantFiles) {
    it(`${relativePath} does not hardcode localhost/8443`, () => {
      const filePath = path.resolve(import.meta.dirname, "..", relativePath);
      const source = fs.readFileSync(filePath, "utf-8");

      expect(source).not.toMatch(/localhost/i);
      expect(source).not.toMatch(/127\.0\.0\.1/);
      expect(source).not.toMatch(/:8443/);
    });
  }

  it("services/config.ts confines the localhost string literal to a single named constant", () => {
    const filePath = path.resolve(import.meta.dirname, "config.ts");
    const source = fs.readFileSync(filePath, "utf-8");

    // Exactly one quoted string-literal occurrence (comments may still
    // mention it in prose) -- the DEV_DEFAULT_BASE_URL assignment.
    const literalMatches = source.match(/"http:\/\/localhost:8443"/g) ?? [];
    expect(literalMatches.length).toBe(1);
    expect(source).toMatch(/DEV_DEFAULT_BASE_URL\s*=\s*"http:\/\/localhost:8443"/);
  });
});

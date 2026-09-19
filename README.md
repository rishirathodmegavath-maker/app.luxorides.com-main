# LuxoRides Customer App

The customer-facing booking web app for LuxoRides -- browse vehicles, book a chauffeur-driven duty, track a driver live, pay, and manage bookings. Built with Next.js (App Router), and also wrapped with Capacitor for an Android/iOS shell.

## Requirements

- Node.js 20+
- The [Fleetovo backend](../fleetovo-core-service-main) running and reachable

## Local development

Copy `.env.example` to `.env.local` and fill in real values (see the comments in that file for what each one does and its fallback behavior):

```bash
cp .env.example .env.local
```

At minimum for local development against a backend running on `localhost:8443`, `.env.local` can be left empty -- `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8443` in dev. `NEXT_PUBLIC_GOOGLE_MAPS_KEY` has no fallback (a real key can't be hardcoded in source -- see the comment in `services/config.ts`); without it, dev logs a console warning and map-dependent UI (`LiveDriverMap`, `LocationInput`, trip tracking) just won't load a map. Set both explicitly for anything beyond local development; production builds refuse to start without either set.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

`NEXT_PUBLIC_*` variables are baked into the bundle at **build** time, not read at server runtime -- set them before `npm run build`, not just before `npm start`.

## Tests and lint

```bash
npm test
npm run lint
```

## Mobile shell (Capacitor)

```bash
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

Builds the same Next.js app into a native Android/iOS shell via Capacitor. Requires Android Studio / Xcode respectively.

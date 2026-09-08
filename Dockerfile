# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Required -- NEXT_PUBLIC_ variables are inlined into the JS bundle at build
# time, so the real backend URL must be supplied here, e.g.:
#   docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com .
# The build fails intentionally (see services/config.ts) if this is left
# unset, rather than silently shipping an image that targets localhost.
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# ---------- Runtime Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Copy standalone output only (minimal runtime footprint)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["node", "server.js"]

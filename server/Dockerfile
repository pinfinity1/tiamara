# ───────────────────────────────────────────────────────────────
# Stage 1: Base
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ───────────────────────────────────────────────────────────────
# Stage 2: Deps (cache-optimised)
# ───────────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ───────────────────────────────────────────────────────────────
# Stage 3: Builder
# ───────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY prisma prisma
COPY . .

RUN npx prisma generate
RUN npm run build

# ───────────────────────────────────────────────────────────────
# Stage 4: Production deps only
# ───────────────────────────────────────────────────────────────
FROM base AS proddeps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ───────────────────────────────────────────────────────────────
# Stage 5: Chromium Layer (needed for Puppeteer)
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# ───────────────────────────────────────────────────────────────
# Stage 6: Final Runtime (Distroless)
# ───────────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PORT=5001

COPY --from=proddeps /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY --from=builder /app/prisma prisma
COPY --from=chromium /usr/bin/chromium-browser /usr/bin/chromium-browser
COPY --from=chromium /usr/lib/ /usr/lib/

USER nonroot

EXPOSE 5001

CMD ["dist/index.js"]

# ───────────────────────────────────────────────────────────────
# Stage 1: Base image
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ───────────────────────────────────────────────────────────────
# Stage 2: Dependencies (cache-friendly)
# ───────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ───────────────────────────────────────────────────────────────
# Stage 3: Builder (Next.js build)
# ───────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build

# ───────────────────────────────────────────────────────────────
# Stage 4: Production deps only
# ───────────────────────────────────────────────────────────────
FROM base AS proddeps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ───────────────────────────────────────────────────────────────
# Stage 5: Distroless Final Runtime
# ───────────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20 as runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=proddeps /app/node_modules node_modules
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY next.config.js ./

USER nonroot

EXPOSE 3000

CMD ["npm", "start"]

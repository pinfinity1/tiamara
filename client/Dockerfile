# client/Dockerfile

# --- Stage 1: Base ---
FROM node:20-alpine AS base
WORKDIR /app

# --- Stage 2: Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build

# --- Stage 4: Runner (Standalone) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ساخت کاربر امن
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# کپی فایل‌های استاتیک
COPY --from=builder /app/public ./public

# ✅ تغییر مهم: کپی کردن پوشه standalone (نسخه سبک)
# این پوشه شامل تمام چیزهایی است که برای اجرا لازم دارید
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# ✅ تغییر مهم: دستور اجرا دیگر npm start نیست
CMD ["node", "server.js"]
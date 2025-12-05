# client/Dockerfile

# ───────────────────────────────────────────────────────────────
# Stage 1: Base image
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ───────────────────────────────────────────────────────────────
# Stage 2: Dependencies
# ───────────────────────────────────────────────────────────────
FROM base AS deps
# نصب libc6-compat برای سازگاری بهتر برخی کتابخانه‌ها در Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ───────────────────────────────────────────────────────────────
# Stage 3: Builder
# ───────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# دریافت متغیر محیطی زمان بیلد
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build

# ───────────────────────────────────────────────────────────────
# Stage 4: Production Runner (تغییر یافته به Alpine)
# ───────────────────────────────────────────────────────────────
# ✅ تغییر مهم: استفاده از alpine به جای distroless برای داشتن sh و npm
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# ✅ امنیت: ساخت کاربر غیر روت
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# کپی فایل‌های عمومی
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# کپی پوشه بیلد و ماژول‌ها با تنظیم مالکیت
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# اگر فایل کانفیگ دارید، آن را هم کپی کنید
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# تغییر کاربر
USER nextjs

EXPOSE 3000

# دستور اجرا
CMD ["npm", "start"]
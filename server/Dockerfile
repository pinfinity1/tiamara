# server/Dockerfile

# --- Stage 1: Base ---
FROM node:20-alpine AS base

# --- Stage 2: Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package*.json ./
# نصب پکیج‌ها (شامل devDependencies برای بیلد)
RUN npm ci

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# جنریت کردن کلاینت پریزما
RUN npx prisma generate
# بیلد کردن پروژه (Typescript -> JS)
RUN npm run build

# --- Stage 4: Production Runner (Final Image) ---
FROM base AS runner
WORKDIR /app

# ✅ بهینه‌سازی ۱: نصب Chromium برای Puppeteer
# این بخش حیاتی است تا Puppeteer بدون دانلود کروم کار کند
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# تنظیم متغیرهای محیطی Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# کپی کردن فایل‌های پکیج
COPY package*.json ./

# ✅ بهینه‌سازی ۲: نصب فقط پکیج‌های پروداکشن (کاهش حجم)
RUN npm ci --only=production && npm cache clean --force

# کپی کردن فایل‌های بیلد شده و پریزما از مرحله قبل
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# جنریت مجدد کلاینت برای اطمینان در محیط پروداکشن
RUN npx prisma generate

# ✅ بهینه‌سازی ۳: امنیت (کاربر غیر روت)
# تغییر مالکیت فایل‌ها به کاربر node
RUN chown -R node:node /app

# تغییر کاربر به node
USER node

# پورت سرور
EXPOSE 5001

# دستور پیش‌فرض (این دستور توسط docker-compose.prod.yml بازنویسی می‌شود اما بودنش استاندارد است)
CMD ["npm", "start"]
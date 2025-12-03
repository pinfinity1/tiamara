# --- Stage 1: Base (پایه) ---
FROM node:20-alpine AS base

# --- Stage 2: Dependencies (نصب پکیج‌ها برای بیلد) ---
FROM base AS deps
WORKDIR /app
COPY package*.json ./
# استفاده از ci برای نصب تمیزتر و سریع‌تر در CI/CD
RUN npm ci

# --- Stage 3: Builder (ساخت پروژه) ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# جنریت کردن پریزما
RUN npx prisma generate
# بیلد کردن پروژه (تبدیل TS به JS)
RUN npm run build

# --- Stage 4: Production Runner (اجرا کننده نهایی) ---
FROM base AS runner
WORKDIR /app

# ✅ ۱. نصب پکیج‌های سیستمی ضروری برای Puppeteer و Chromium
# این بخش حیاتی‌ترین تغییر است
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# ✅ ۲. تنظیم متغیرهای محیطی برای Puppeteer
# به پاپتیر می‌گوییم کروم را دانلود نکن (چون بالا نصب کردیم) و از مسیر سیستمی استفاده کن
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# کپی کردن فایل‌های پکیج
COPY package*.json ./

# ۳. نصب فقط پکیج‌های پروداکشن (بدون devDependencies) برای کاهش حجم
RUN npm ci --only=production && npm cache clean --force

# ۴. کپی کردن پریزما و جنریت کلاینت برای محیط پروداکشن
COPY prisma ./prisma
RUN npx prisma generate

# ۵. کپی کردن فایل‌های بیلد شده از مرحله Builder
COPY --from=builder /app/dist ./dist

# ۶. تنظیم دسترسی‌ها (Best Practice امنیتی)
# تغییر مالکیت فایل‌ها به کاربر 'node' و اجرای کانتینر با این کاربر
RUN chown -R node:node /app
USER node

# پورت (مطمئن شوید با پورت اپلیکیشن یکی است، معمولا 5001 یا 3001)
EXPOSE 5001

CMD ["npm", "start"]
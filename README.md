# 💄 Tiamara | فروشگاه اینترنتی تیامارا

**Tiamara** یک پلتفرم تجارت الکترونیک پیشرفته برای فروش محصولات **آرایشی و بهداشتی** است که با تمرکز بر **تجربه کاربری مدرن، هوش مصنوعی، شخصی‌سازی محصولات و معماری ماژولار** طراحی شده است.

این سیستم شامل **کلاینت (Next.js)**، **سرور (Express.js)**، داشبورد مدیریت، سیستم انبارداری، چت‌بات هوشمند و زیرساخت کامل مبتنی بر Docker است.

---

## ✨ ویژگی‌های کلیدی

### 🛍️ تجربه کاربری (Client)

- **پروفایل پوستی هوشمند:** تشخیص نوع پوست کاربر با پرسشنامه تخصصی ۱۰ مرحله‌ای و ارائه پیشنهاد محصول.
- **دستیار هوشمند (AI Chat - Tiam):** چت‌بات مبتنی بر OpenAI برای مشاوره خرید و پاسخ به سوالات.
- **ویدیو شوکیس:** نمایش ریل/استوری محصول در صفحه اصلی.
- **جستجوی پیشرفته:** جستجو در محصولات، برندها و دسته‌ها + ذخیره تاریخچه کاربر.
- **سبد خرید حرفه‌ای:** سینک سبد مهمان/کاربر + پرداخت آنلاین زرین‌پال.
- **احراز هویت ایمن:** ورود دو مرحله‌ای (Password + OTP) با سرویس SMS.ir.

---

### 🛠️ پنل مدیریت (Super Admin)

- داشبورد با گزارشات فروش، سفارشات، مشتریان و موجودی انبار
- مدیریت محصولات (ویژگی‌ها، ترکیبات، سازگاری پوستی، قیمت، ویدیو، تصاویر)
- مدیریت دسته‌بندی‌ها و برندها
- سیستم حرفه‌ای انبارداری + تامین‌کنندگان + Purchase Order
- CMS کامل برای صفحه اصلی (بنر — اسلایدر — Drag & Drop)
- سیستم تخفیف، کوپن و روش‌های ارسال

---

## 🚀 تکنولوژی‌ها و معماری

### Frontend (Client)

- **Next.js 15 (App Router)**
- **TypeScript**
- Tailwind CSS + Shadcn UI
- Zustand (State Management)
- React Hook Form + Zod
- NextAuth.js v5 (Beta)

### Backend (Server)

- Node.js + Express.js
- PostgreSQL
- Prisma ORM
- Cloudinary (آپلود عکس/ویدیو)
- OpenAI API (چت‌بات)
- SMS.ir (ارسال OTP)
- Arcjet (Rate limiting & Security)

### DevOps / Infrastructure

- Docker & Docker Compose
- Nginx (Reverse Proxy)
- GitHub Actions (CI/CD)

---

## 🛠️ نصب و راه‌اندازی

### 📌 پیش‌نیازها

- Docker & Docker Compose
- (اختیاری) Node.js 18+

---

## 🐳 روش اول — اجرای پروژه با Docker (توصیه شده)

### 1. کلون کردن مخزن

```bash
git clone https://github.com/your-username/tiamara.git
cd tiamara
```

### 2. ساخت فایل `.env`

یک فایل `.env` بسازید (نمونه کامل در ادامه آمده است).

### 3. اجرای پروژه

```bash
docker-compose -f docker-compose.dev.yml up --build
```

پس از اجرا:

- کلاینت: [http://localhost:3000](http://localhost:3000)
- سرور: [http://localhost:5001](http://localhost:5001)
- PostgreSQL: `localhost:5436`

---

## 🖥️ روش دوم — اجرای دستی (Local Development)

### 1. تنظیم دیتابیس

یک دیتابیس PostgreSQL ایجاد کنید و مقدار `DATABASE_URL` را در `.env` بگذارید.

### 2. راه‌اندازی سرور

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run seed   # اختیاری: ایجاد ادمین و داده اولیه
npm run dev
```

### 3. راه‌اندازی کلاینت

```bash
cd client
npm install
npm run dev
```

---

## 🔐 فایل محیطی (`.env`)

نمونه کامل:

```
# --- DATABASE ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=tiamara_db

# Docker internal connection
DATABASE_URL="postgresql://postgres:your_secure_password@postgres:5432/tiamara_db"

# Local manual connection
# DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5436/tiamara_db"

# --- SERVER ---
PORT=5001
CLIENT_URL=http://localhost:3000
API_BASE_URL_SERVER=http://server:3001/api

# --- CLIENT ---
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
AUTH_SECRET=your_generated_secret_key

# --- AUTH & SECURITY ---
JWT_SECRET=your_jwt_secret_key

# --- SERVICES ---
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=your_openai_key

# SMS.ir
SMS_IR_API_KEY=your_sms_ir_api_key
SMS_IR_TEMPLATE_ID=your_template_id

# Arcjet
ARCJET_KEY=your_arcjet_key
```

---

## 📂 ساختار کلی پروژه

```
tiamara/
├── client/                 # Next.js Frontend
│   ├── src/app            # Routing (App Router)
│   ├── src/components     # UI Components
│   ├── src/store          # Zustand State
│   └── ...
├── server/                 # Backend (Express)
│   ├── src/controllers    # Business logic
│   ├── src/routes         # API routes
│   ├── prisma/            # Database schema
│   └── ...
├── nginx/                  # Nginx reverse proxy config
└── docker-compose.*.yml    # Docker setup
```

## 📄 License

این پروژه تحت لایسنس **MIT License** منتشر شده است.
برای اطلاعات بیشتر: `LICENSE`

---

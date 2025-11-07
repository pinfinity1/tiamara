import { prisma } from "../server";
import bcrypt from "bcryptjs";
import { sendManualOtp } from "./smsService"; // <-- ۱. سرویس جدید را وارد کنید

const OTP_EXPIRATION_MINUTES = 2;
const MAX_OTP_ATTEMPTS = 3;

/**
 * کدی را می‌سازد، در دیتابیس ذخیره می‌کند و آن را SMS می‌کند
 */
export async function generateAndSaveOtp(identifier: string): Promise<string> {
  // (identifier در اینجا همان شماره موبایل است)

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // پاک کردن توکن‌های قبلی
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  // ذخیره توکن جدید
  await prisma.verificationToken.create({
    data: { identifier, token: hashedOtp, expires, attempts: 0 },
  });

  // !! --- ۲. بخش ارسال پیامک اینجا اضافه شد --- !!
  // این تابع اکنون به صورت خودکار بین پروداکشن و توسعه تمایز قائل می‌شود
  try {
    await sendManualOtp(identifier, otp); // 'identifier' همان 'phone' است
  } catch (smsError) {
    console.error(`Failed to send OTP SMS to ${identifier}`, smsError);
    // اگر ارسال پیامک (حتی در پروداکشن) شکست خورد،
    // ما خطا را برمی‌گردانیم تا authController به کاربر پیغام خطا بدهد
    throw new Error("Failed to send verification SMS.");
  }
  // !! --- پایان تغییر --- !!

  // ما هنوز کد را برمی‌گردانیم (این برای لاگ کردن در authController مفید است)
  return otp;
}

/**
 * کد ارسال شده را تایید می‌کند
 * (این تابع عالی بود و نیازی به تغییر نداشت)
 */
export async function verifyOtp(
  identifier: string,
  token: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  // اگر توکن وجود نداشت، منقضی شده بود، یا تلاش‌ها تمام شده بود
  if (
    !verificationToken ||
    verificationToken.expires < new Date() ||
    verificationToken.attempts >= MAX_OTP_ATTEMPTS
  ) {
    if (verificationToken) {
      // توکن نامعتبر را پاک کن
      await prisma.verificationToken.delete({
        where: { token: verificationToken.token },
      });
    }
    return false;
  }

  // مقایسه کد وارد شده با هش ذخیره شده
  const isTokenValid = await bcrypt.compare(token, verificationToken.token);

  if (isTokenValid) {
    // اگر معتبر بود، توکن را پاک کن (یکبار مصرف)
    await prisma.verificationToken.delete({
      where: { token: verificationToken.token },
    });
    return true;
  } else {
    // اگر نامعتبر بود، تعداد تلاش‌ها را یکی اضافه کن
    await prisma.verificationToken.update({
      where: { token: verificationToken.token },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }
}

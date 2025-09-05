import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const OTP_EXPIRATION_MINUTES = 2;

async function generateAndSaveOtp(identifier: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedOtp, expires },
  });

  return otp;
}

export async function sendOtp(phone: string) {
  try {
    const otp = await generateAndSaveOtp(phone);

    console.log(`\n\n✅ کد یکبار مصرف برای ${phone}: ${otp}\n\n`);

    return { success: true, message: "کد یکبار مصرف (تستی) ایجاد شد." };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "خطای سرور در ارسال پیامک." };
  }
}

export async function verifyOtp(identifier: string, token: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return false;
  }

  const isTokenValid = await bcrypt.compare(token, verificationToken.token);
  if (isTokenValid) {
    await prisma.verificationToken.delete({
      where: { token: verificationToken.token },
    });
  }

  return isTokenValid;
}

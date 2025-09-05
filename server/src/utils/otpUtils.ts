import { prisma } from "../server";
import bcrypt from "bcryptjs";

const OTP_EXPIRATION_MINUTES = 2;

export async function generateAndSaveOtp(identifier: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedOtp, expires },
  });

  return otp;
}

export async function verifyOtp(
  identifier: string,
  token: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return false;
  }

  const isTokenValid = await bcrypt.compare(token, verificationToken.token);

  if (isTokenValid) {
    // در Prisma، مدل VerificationToken کلید منحصر به فرد روی identifier و token دارد
    // برای حذف، بهتر است از ترکیب آن‌ها یا یک id منحصر به فرد استفاده کنیم.
    // اگر مدل شما id ندارد، این روش کار می‌کند.
    await prisma.verificationToken.deleteMany({
      where: { identifier: identifier, token: verificationToken.token },
    });
  }

  return isTokenValid;
}

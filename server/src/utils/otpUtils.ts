import { prisma } from "../server";
import bcrypt from "bcryptjs";

const OTP_EXPIRATION_MINUTES = 2;
const MAX_OTP_ATTEMPTS = 3;

export async function generateAndSaveOtp(identifier: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedOtp, expires, attempts: 0 },
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

  if (
    !verificationToken ||
    verificationToken.expires < new Date() ||
    verificationToken.attempts >= MAX_OTP_ATTEMPTS
  ) {
    if (verificationToken) {
      await prisma.verificationToken.delete({
        where: { token: verificationToken.token },
      });
    }
    return false;
  }

  const isTokenValid = await bcrypt.compare(token, verificationToken.token);

  if (isTokenValid) {
    await prisma.verificationToken.delete({
      where: { token: verificationToken.token },
    });
    return true;
  } else {
    await prisma.verificationToken.update({
      where: { token: verificationToken.token },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }
}

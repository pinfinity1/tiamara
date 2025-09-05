import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // اطلاعات ورود ادمین اصلی
  const adminPhone = "09000000000"; // شماره موبایل ادمین - می‌توانید تغییر دهید
  const adminPassword = "123456"; // رمز عبور ادمین
  const adminName = "Super Admin";

  // ابتدا چک می‌کنیم که آیا ادمینی با این شماره وجود دارد یا نه
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { phone: adminPhone },
  });

  if (existingSuperAdmin) {
    console.log("Super admin already exists.");
    return;
  }

  // اگر وجود نداشت، یک ادمین جدید با شماره و رمز عبور ایجاد می‌کنیم
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const superAdminUser = await prisma.user.create({
    data: {
      phone: adminPhone,
      name: adminName,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(
    "Super admin created successfully with phone:",
    superAdminUser.phone
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

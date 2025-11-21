import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- تنظیمات سوپر ادمین ---
  const adminPhone = "09397155826";
  const adminPassword = "123456"; // رمز عبور اولیه
  const adminName = "Super Admin";

  console.log("Checking/Creating Super Admin...");

  // هش کردن پسورد
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // ساخت یا آپدیت ادمین
  const superAdminUser = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      // اگر کاربر وجود داشت، مطمئن می‌شویم نقش و پسوردش صحیح است
      name: adminName,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
    create: {
      // اگر کاربر وجود نداشت، آن را می‌سازیم
      phone: adminPhone,
      name: adminName,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(
    "Super admin processed successfully. Phone:",
    superAdminUser.phone
  );

  // --- بخش Shipping Methods کاملاً حذف شد ---
  // چون مدیریت آن اکنون از طریق پنل ادمین انجام می‌شود.
}

main()
  .catch((e) => {
    console.error("Error in seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

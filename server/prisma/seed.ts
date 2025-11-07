import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPhone = "09397155826";
  const adminPassword = "123456";
  const adminName = "Super Admin";

  // --- کد اصلاح شده ---
  // پسورد را در هر صورت هش می‌کنیم
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // از دستور upsert استفاده می‌کنیم
  const superAdminUser = await prisma.user.upsert({
    where: { phone: adminPhone }, // با این شماره تلفن پیدا کن
    update: {
      // اگر پیدا شد: اطلاعاتش را به‌روز کن و مطمئن شو ادمین است
      name: adminName,
      password: hashedPassword,
      role: "SUPER_ADMIN", // <-- نقش را تضمین می‌کند
    },
    create: {
      // اگر پیدا نشد: یک کاربر جدید با نقش ادمین بساز
      phone: adminPhone,
      name: adminName,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(
    "Super admin created or updated successfully with phone:",
    superAdminUser.phone
  );
  // --- پایان کد اصلاح شده ---

  console.log("Start seeding shipping methods...");

  await prisma.shippingMethod.upsert({
    where: { code: "pishaz" },
    update: {},
    create: {
      code: "pishaz",
      name: "پست پیشتاز",
      description: "۳ تا ۵ روز کاری",
      cost: 35000,
      isActive: true,
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "tipax" },
    update: {},
    create: {
      code: "tipax",
      name: "تیپاکس (پس کرایه)",
      description: "۲ تا ۳ روز کاری",
      cost: 0,
      isActive: true,
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "home_delivery" },
    update: {},
    create: {
      code: "home_delivery",
      name: "تحویل درب منزل (ارسال با پیک)",
      description: "ارسال سریع در محدوده شهری (۱ تا ۴ ساعت)",
      cost: 25000,
      isActive: true,
    },
  });

  console.log("Shipping methods seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

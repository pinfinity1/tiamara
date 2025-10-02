import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPhone = "09397155826";
  const adminPassword = "123456";
  const adminName = "Super Admin";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { phone: adminPhone },
  });

  if (!existingSuperAdmin) {
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
  } else {
    console.log("Super admin already exists. Skipping creation.");
  }

  // const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // const superAdminUser = await prisma.user.create({
  //   data: {
  //     phone: adminPhone,
  //     name: adminName,
  //     password: hashedPassword,
  //     role: "SUPER_ADMIN",
  //   },
  // });

  // console.log(
  //   "Super admin created successfully with phone:",
  //   superAdminUser.phone
  // );

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

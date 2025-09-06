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

  if (existingSuperAdmin) {
    console.log("Super admin already exists.");
    return;
  }

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

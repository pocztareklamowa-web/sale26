import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@bank.pl" },
    update: {},
    create: {
      email: "admin@bank.pl",
      name: "Administrator",
      password: adminPassword,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Seed zakończony. Admin: admin@bank.pl / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

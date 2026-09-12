import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.person.upsert({
    where: { id: "samu" },
    update: {},
    create: { id: "samu", name: "Samu", colorTag: "#c05a34" },
  });

  await prisma.person.upsert({
    where: { id: "luisa" },
    update: {},
    create: { id: "luisa", name: "Luisa", colorTag: "#2f6f6a" },
  });

  console.log("Seed abgeschlossen: Samu & Luisa angelegt.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

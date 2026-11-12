import { PrismaClient } from "@prisma/client";
// SQLite's migration engine expects the database file to exist in Prisma 6.
// Connecting creates it without replacing an existing database.
const db = new PrismaClient();
db.$connect()
  .then(() => db.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await db.$disconnect();
    process.exitCode = 1;
  });

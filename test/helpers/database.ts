import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

export async function withDatabase(
  run: (db: PrismaClient, url: string) => Promise<void>,
) {
  const baseUrl =
    process.env.TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "postgresql://card:card@127.0.0.1:5432/card?schema=public";
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  const parsedUrl = new URL(baseUrl);
  parsedUrl.searchParams.set("schema", schema);
  const url = parsedUrl.toString();
  const admin = new PrismaClient({ datasourceUrl: baseUrl });
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  const db = new PrismaClient({ datasourceUrl: url });
  try {
    await db.$connect();
    execFileSync(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      {
        env: { ...process.env, DATABASE_URL: url },
        stdio: "pipe",
      },
    );
    await run(db, url);
  } finally {
    await db.$disconnect();
    await admin.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
    );
    await admin.$disconnect();
  }
}

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

export async function withDatabase(run: (db: PrismaClient) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "card-integration-"));
  const url = `file:${join(directory, "test.db")}`;
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
    await run(db);
  } finally {
    await db.$disconnect();
    await rm(directory, { recursive: true, force: true });
  }
}

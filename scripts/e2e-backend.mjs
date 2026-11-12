import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// A private database and dedicated port keep browser tests away from the user's data.
const baseUrl =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://card:card@127.0.0.1:5432/card?schema=public";
const schema = `e2e_${randomUUID().replaceAll("-", "")}`;
const parsedUrl = new URL(baseUrl);
parsedUrl.searchParams.set("schema", schema);
const admin = new PrismaClient({ datasourceUrl: baseUrl });
const env = {
  ...process.env,
  DATABASE_URL: parsedUrl.toString(),
  PORT: "3100",
};
let child;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (child?.pid && child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
  }
  await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.$disconnect();
  process.exit(code);
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());
function run(command, args) {
  return new Promise((resolve, reject) => {
    child = spawn(command, args, { env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} failed: ${code}`)),
    );
  });
}
try {
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  await run(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "-p",
    "tsconfig.json",
  ]);
  await run(process.execPath, [
    "node_modules/prisma/build/index.js",
    "migrate",
    "deploy",
  ]);
  await run(process.execPath, [
    "node_modules/tsx/dist/cli.mjs",
    "prisma/seed.ts",
  ]);
  await run(process.execPath, ["dist/src/main.js"]);
  await stop();
} catch (error) {
  if (!stopping) {
    console.error(error);
    await stop(1);
  }
}

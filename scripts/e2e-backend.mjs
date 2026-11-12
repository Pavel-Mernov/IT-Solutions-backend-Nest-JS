import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

// A private database and dedicated port keep browser tests away from the user's data.
const directory = await mkdtemp(join(tmpdir(), "card-e2e-"));
const env = {
  ...process.env,
  DATABASE_URL: `file:${join(directory, "card.db")}`,
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
  await rm(directory, { recursive: true, force: true });
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
  await run(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "-p",
    "tsconfig.json",
  ]);
  await run(process.execPath, [
    "node_modules/tsx/dist/cli.mjs",
    "prisma/prepare.ts",
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

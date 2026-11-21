import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { seed } from "../../prisma/seed";
import { profileData } from "../../prisma/profile-data";
import { ProfileRepository } from "../../src/profile/profile.repository";
import { PrismaService } from "../../src/prisma/prisma.service";
import { withDatabase } from "../helpers/database";

test("migrates a fresh database and seeds projects and experience idempotently", async () => {
  await withDatabase(async (db) => {
    await seed(db);
    await seed(db);
    assert.equal(await db.profile.count(), 1);
    assert.equal(await db.project.count(), 5);
    assert.equal(await db.experience.count(), 4);
    assert.equal(await db.skill.count(), profileData.skills.length);
    const repository = new ProfileRepository(db as PrismaService);
    const owner = await repository.findOwner();
    assert.deepEqual(
      owner?.experience.map((item) => item.projectName),
      ["RISC-V Course", "Smart-Credit", "naparnik", "Clover English"],
    );
    assert.ok(owner?.experience.every((item) => item.startDate === null));
    assert.equal(owner?.projects[6].name, "Визитная карточка на NestJS");
    await db.profile.delete({ where: { id: "owner" } });
    for (const count of await Promise.all([
      db.skill.count(),
      db.project.count(),
      db.experience.count(),
      db.professionalLink.count(),
    ]))
      assert.equal(count, 0);
    assert.equal(await repository.findOwner(), null);
  });
});

test("a failed seed rolls back all profile and collection changes", async () => {
  await withDatabase(async (db) => {
    await seed(db);
    await db.profile.update({
      where: { id: "owner" },
      data: { name: "Previous profile" },
    });
    await db.skill.create({
      data: {
        id: "manual-skill",
        name: "Previous skill",
        profileId: "owner",
        order: 999,
      },
    });
    await db.$executeRawUnsafe(`
      CREATE FUNCTION reject_project() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'seed failure';
      END;
      $$ LANGUAGE plpgsql
    `);
    await db.$executeRawUnsafe(`
      CREATE TRIGGER reject_project
      BEFORE INSERT ON "Project"
      FOR EACH ROW EXECUTE FUNCTION reject_project()
    `);
    await assert.rejects(seed(db));
    assert.equal(
      (await db.profile.findUniqueOrThrow({ where: { id: "owner" } })).name,
      "Previous profile",
    );
    assert.equal(
      (await db.skill.findUniqueOrThrow({ where: { id: "manual-skill" } }))
        .name,
      "Previous skill",
    );
    assert.equal(await db.project.count(), 5);
    assert.equal(await db.experience.count(), 4);
  });
});

test("nested collection SQL count stays bounded as data grows", async () => {
  await withDatabase(async (db, url) => {
    await seed(db);
    // A separate client observes actual SQL on this test database.
    const tracing = new PrismaClient({
      datasourceUrl: url,
      log: [{ emit: "event", level: "query" }],
    });
    let queries = 0;
    tracing.$on("query", () => queries++);
    try {
      const repository = new ProfileRepository(
        tracing as unknown as PrismaService,
      );
      const before = await repository.findOwner();
      const initialQueries = queries;
      await db.skill.createMany({
        data: Array.from({ length: 50 }, (_, order) => ({
          id: `extra-${order}`,
          name: `Extra ${order}`,
          order: order + 100,
          profileId: "owner",
        })),
      });
      await db.project.createMany({
        data: Array.from({ length: 30 }, (_, order) => ({
          id: `extra-project-${order}`,
          name: `Extra ${order}`,
          url: "https://example.com",
          description: "Test",
          technologies: "[]",
          order: order + 100,
          profileId: "owner",
        })),
      });
      queries = 0;
      const after = await repository.findOwner();
      assert.equal(queries, initialQueries);
      assert.ok(queries <= 5);
      assert.equal(after?.skills.length, before!.skills.length + 50);
      assert.equal(after?.projects.length, before!.projects.length + 30);
    } finally {
      await tracing.$disconnect();
    }
  });
});

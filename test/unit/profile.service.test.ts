import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { ProfileService } from "../../src/profile/profile.service";
import { ProfileRepository } from "../../src/profile/profile.repository";
import { profileFixture } from "../helpers/profile-fixture";

function serviceWith(findOwner: ProfileRepository["findOwner"]) {
  // Only the repository boundary is replaced; no Nest container or database.
  return new ProfileService({ findOwner } as ProfileRepository);
}

test("returns null when the owner does not exist", async () => {
  const service = serviceWith(async () => null);
  assert.equal(await service.getProfile(), null);
});

test("decodes project technologies without modifying stored data", async () => {
  const stored = profileFixture();
  let calls = 0;
  const service = serviceWith(async () => {
    calls++;
    return stored;
  });
  const result = await service.getProfile();
  assert.equal(calls, 1);
  assert.ok(Array.isArray(result?.projects[0].technologies));
  assert.ok(result?.projects[0].technologies.includes("React"));
  assert.equal(typeof stored.projects[0].technologies, "string");
  assert.deepEqual(result?.experience, stored.experience);
});

test("preserves empty collections", async () => {
  const service = serviceWith(async () => ({
    ...profileFixture(),
    projects: [],
    experience: [],
    skills: [],
    links: [],
  }));
  const result = await service.getProfile();
  assert.deepEqual(result?.projects, []);
  assert.deepEqual(result?.experience, []);
});

test("propagates repository errors instead of reporting an empty profile", async () => {
  const failure = new Error("Database unavailable");
  const service = serviceWith(async () => {
    throw failure;
  });
  await assert.rejects(service.getProfile(), (error) => error === failure);
});

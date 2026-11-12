import "reflect-metadata";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { Test } from "@nestjs/testing";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import { graphql, GraphQLSchema } from "graphql";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { ProfileRepository } from "../../src/profile/profile.repository";
import { PrismaService } from "../../src/prisma/prisma.service";
import { profileFixture } from "../helpers/profile-fixture";

let app: INestApplication;
let schema: GraphQLSchema;
let owner: ReturnType<typeof profileFixture> | null;
before(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ProfileRepository)
    .useValue({ findOwner: async () => owner })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  app = module.createNestApplication();
  await app.init();
  schema = app.get(GraphQLSchemaHost).schema;
});
after(async () => {
  await app?.close();
});

test("executes nested GraphQL contract through resolver and service", async () => {
  owner = profileFixture();
  const result = await graphql({
    schema,
    source: `{ profile {
    name links { label url } skills { name }
    experience { company projectName position period startDate endDate achievements }
    projects { name technologies website }
  } }`,
  });
  assert.equal(result.errors, undefined);
  const profile = result.data?.profile as {
    name: string;
    experience: {
      projectName: string;
      startDate: string | null;
      period: string;
    }[];
    projects: { technologies: string[]; website: string | null }[];
  };
  assert.equal(profile.name, "Павел Константинович Мернов");
  assert.equal(profile.experience.length, 4);
  assert.equal(profile.experience[0].projectName, "RISC-V Course");
  assert.equal(profile.experience[0].startDate, null);
  assert.match(profile.experience[2].period, /3 курс/);
  assert.ok(profile.projects[4].technologies.includes("React"));
  assert.equal(profile.projects[4].website, null);
});

test("allows missing profile and rejects unknown fields", async () => {
  owner = null;
  const empty = await graphql({ schema, source: "{ profile { name } }" });
  assert.equal(empty.errors, undefined);
  assert.equal(empty.data?.profile, null);
  const invalid = await graphql({
    schema,
    source: "{ profile { unknownField } }",
  });
  assert.match(invalid.errors?.[0].message ?? "", /Cannot query field/);
});

test("schema is read-only and exposes nullable dates for undated project work", () => {
  assert.equal(schema.getMutationType(), undefined);
  const type = schema.getType("Experience");
  assert.ok(type && "getFields" in type);
  const fields = type.getFields();
  assert.equal(fields.startDate.type.toString(), "DateTime");
  assert.equal(fields.period.type.toString(), "String!");
});

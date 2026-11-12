import { PrismaClient } from "@prisma/client";
import { profileData } from "./profile-data";
export const PROFILE_ID = "owner";
export async function seed(db: PrismaClient) {
  const { links, skills, experience, projects, ...profile } = profileData;
  // One transaction: readers see either the previous complete card or the new one.
  await db.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: PROFILE_ID },
      create: { id: PROFILE_ID, ...profile },
      update: profile,
    });
    await tx.professionalLink.deleteMany({ where: { profileId: PROFILE_ID } });
    await tx.skill.deleteMany({ where: { profileId: PROFILE_ID } });
    await tx.experience.deleteMany({ where: { profileId: PROFILE_ID } });
    await tx.project.deleteMany({ where: { profileId: PROFILE_ID } });
    await tx.profile.update({
      where: { id: PROFILE_ID },
      data: {
        links: {
          create: links.map((item, order) => ({
            ...item,
            order,
            id: `link-${order}`,
          })),
        },
        skills: {
          create: skills.map((name, order) => ({
            name,
            order,
            id: `skill-${order}`,
          })),
        },
        experience: {
          create: experience.map((item, order) => ({
            ...item,
            order,
            id: `experience-${order}`,
          })),
        },
        projects: {
          create: projects.map((item, order) => ({
            ...item,
            technologies: JSON.stringify(item.technologies),
            order,
            id: `project-${order}`,
          })),
        },
      },
    });
  });
}
if (require.main === module) {
  const db = new PrismaClient();
  seed(db)
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}

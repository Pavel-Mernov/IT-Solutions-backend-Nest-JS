import { profileData } from "../../prisma/profile-data";
import { ProfileRepository } from "../../src/profile/profile.repository";

type StoredProfile = NonNullable<
  Awaited<ReturnType<ProfileRepository["findOwner"]>>
>;
export function profileFixture(): StoredProfile {
  const { links, skills, experience, projects, ...profile } = profileData;
  const metadata = (order: number) => ({
    id: `fixture-${order}`,
    order,
    profileId: "owner",
  });
  return {
    id: "owner",
    ...profile,
    links: links.map((item, order) => ({ ...item, ...metadata(order) })),
    skills: skills.map((name, order) => ({ name, ...metadata(order) })),
    experience: experience.map((item, order) => ({
      ...item,
      ...metadata(order),
    })),
    projects: projects.map((item, order) => ({
      ...item,
      technologies: JSON.stringify(item.technologies),
      ...metadata(order),
    })),
  };
}

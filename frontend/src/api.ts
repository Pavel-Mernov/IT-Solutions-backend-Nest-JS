export interface Experience {
  company: string;
  projectName: string | null;
  position: string;
  period: string;
  startDate: string | null;
  endDate: string | null;
  achievements: string;
}
export interface Project {
  name: string;
  description: string;
  url: string;
  website: string | null;
  technologies: string[];
}
export interface Profile {
  name: string;
  title: string;
  description: string;
  location: string;
  education: string;
  languages: string;
  links: { label: string; url: string }[];
  skills: { name: string }[];
  experience: Experience[];
  projects: Project[];
}

const PROFILE_QUERY = `query BusinessCard {
  profile {
    name title description location education languages
    links { label url }
    skills { name }
    experience { company projectName position period startDate endDate achievements }
    projects { name description url website technologies }
  }
}`;

export async function fetchProfile(
  signal: AbortSignal,
): Promise<Profile | null> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: PROFILE_QUERY }),
    signal,
  });
  if (!response.ok)
    throw new Error("Сервер временно недоступен. Попробуйте ещё раз.");
  const result: {
    data?: { profile: Profile | null };
    errors?: { message: string }[];
  } = await response.json();
  if (
    result.errors?.length ||
    !result.data ||
    result.data.profile === undefined
  ) {
    throw new Error("Не удалось получить профиль. Попробуйте ещё раз.");
  }
  return result.data.profile;
}

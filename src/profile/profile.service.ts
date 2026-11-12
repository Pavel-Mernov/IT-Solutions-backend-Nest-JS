import { Injectable } from "@nestjs/common";
import { ProfileRepository } from "./profile.repository";
@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}
  async getProfile() {
    const profile = await this.repository.findOwner();
    if (!profile) return null;
    return {
      ...profile,
      projects: profile.projects.map((project) => ({
        ...project,
        technologies: JSON.parse(project.technologies) as string[],
      })),
    };
  }
}

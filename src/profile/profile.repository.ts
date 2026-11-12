import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class ProfileRepository {
  constructor(private readonly db: PrismaService) {}
  async findOwner() {
    return this.db.profile.findUnique({
      where: { id: "owner" },
      include: {
        links: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        experience: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
      },
    });
  }
}

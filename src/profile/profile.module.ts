import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProfileRepository } from "./profile.repository";
import { ProfileResolver } from "./profile.resolver";
import { ProfileService } from "./profile.service";
@Module({
  providers: [
    PrismaService,
    ProfileRepository,
    ProfileService,
    ProfileResolver,
  ],
})
export class ProfileModule {}

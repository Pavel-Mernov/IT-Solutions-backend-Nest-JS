import { Query, Resolver } from "@nestjs/graphql";
import { Profile } from "./profile.models";
import { ProfileService } from "./profile.service";
@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}
  @Query(() => Profile, {
    nullable: true,
    description: "Визитка владельца; null, если профиль отсутствует.",
  })
  profile() {
    return this.service.getProfile();
  }
}

import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
@ObjectType()
export class ProfessionalLink {
  @Field() label!: string;
  @Field() url!: string;
}
@ObjectType()
export class Skill {
  @Field() name!: string;
}
@ObjectType()
export class Experience {
  @Field() company!: string;
  @Field() position!: string;
  @Field(() => String, { nullable: true }) projectName!: string | null;
  @Field() period!: string;
  @Field(() => GraphQLISODateTime, { nullable: true }) startDate!: Date | null;
  @Field(() => GraphQLISODateTime, { nullable: true }) endDate!: Date | null;
  @Field() achievements!: string;
}
@ObjectType()
export class Project {
  @Field() description!: string;
  @Field(() => [String]) technologies!: string[];
  @Field(() => String, { nullable: true }) website!: string | null;
  @Field() name!: string;
  @Field() url!: string;
  @Field() period!: string;
  @Field() featured!: boolean;
}
@ObjectType()
export class Profile {
  @Field() title!: string;
  @Field() location!: string;
  @Field() education!: string;
  @Field() languages!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => [ProfessionalLink]) links!: ProfessionalLink[];
  @Field(() => [Skill]) skills!: Skill[];
  @Field(() => [Experience]) experience!: Experience[];
  @Field(() => [Project]) projects!: Project[];
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchMembersQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  q!: string;
}

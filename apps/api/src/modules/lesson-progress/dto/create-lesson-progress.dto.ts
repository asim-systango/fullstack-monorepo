import { IsBoolean, IsUUID } from 'class-validator';

export class CreateLessonProgressDto {
  @IsUUID()
  lessonId!: string;

  @IsBoolean()
  completed!: boolean;
}

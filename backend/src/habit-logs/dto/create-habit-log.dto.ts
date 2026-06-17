import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateHabitLogDto {
  @IsUUID()
  habitId: string;

  @IsDateString()
  completedAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

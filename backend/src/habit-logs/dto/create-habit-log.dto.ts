import { IsUUID, IsDateString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateHabitLogDto {
  @IsUUID()
  userHabitId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsNumber()
  xpEarned?: number;
}

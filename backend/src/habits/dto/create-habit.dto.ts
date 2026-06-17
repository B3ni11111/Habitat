import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Frequency } from '../habit.entity';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

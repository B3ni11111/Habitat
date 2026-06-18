import { IsOptional, IsNumber } from 'class-validator';

export class UpdateUserHabitDto {
  @IsOptional()
  @IsNumber()
  customTarget?: number | null;
}

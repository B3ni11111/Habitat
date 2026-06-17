import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateUserHabitDto {
  @IsUUID()
  habitId: string;

  @IsOptional()
  @IsNumber()
  customTarget?: number;
}

import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

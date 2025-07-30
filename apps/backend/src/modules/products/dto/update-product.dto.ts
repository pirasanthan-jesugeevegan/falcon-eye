import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUrl()
  path?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

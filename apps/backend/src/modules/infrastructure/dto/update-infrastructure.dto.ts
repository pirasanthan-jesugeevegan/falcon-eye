import { IsString, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class UpdateInfrastructureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  iframeUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

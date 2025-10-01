import { IsString, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreateInfrastructureDto {
  @IsString()
  name: string;

  @IsUrl()
  iframeUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

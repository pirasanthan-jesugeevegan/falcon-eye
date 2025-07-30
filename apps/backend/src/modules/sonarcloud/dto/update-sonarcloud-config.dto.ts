import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateSonarCloudConfigDto {
  @IsOptional()
  @IsString()
  instanceName?: string;

  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;
}

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSonarCloudConfigDto {
  @IsNotEmpty()
  @IsString()
  instanceName: string;

  @IsNotEmpty()
  @IsUrl()
  baseUrl: string;

  @IsNotEmpty()
  @IsString()
  apiToken: string;
}

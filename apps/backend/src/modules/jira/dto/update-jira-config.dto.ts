import {
  IsString,
  IsEmail,
  IsUrl,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateJiraConfigDto {
  @IsOptional()
  @IsString()
  instanceName?: string;

  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;

  @IsOptional()
  @IsString()
  projectKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

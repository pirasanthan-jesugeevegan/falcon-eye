import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class CreateJiraConfigDto {
  @IsNotEmpty()
  @IsString()
  instanceName: string;

  @IsNotEmpty()
  @IsUrl()
  baseUrl: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  apiToken: string;

  @IsOptional()
  @IsString()
  projectKey?: string;
}

import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateJiraQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  jqlQuery?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  jiraConfigId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

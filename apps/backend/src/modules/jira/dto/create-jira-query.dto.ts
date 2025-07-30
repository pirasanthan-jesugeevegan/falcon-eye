import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateJiraQueryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  jqlQuery: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  jiraConfigId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

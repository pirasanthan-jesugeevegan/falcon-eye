import {
  IsString,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsIn,
} from 'class-validator';

export const ALLOWED_METRICS = ['pull_request', 'project_status'] as const;
type MetricType = (typeof ALLOWED_METRICS)[number];

export class UpdateSonarCloudQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  project?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(ALLOWED_METRICS, { each: true })
  metric?: MetricType[];

  @IsOptional()
  @IsUUID()
  sonarCloudConfigId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

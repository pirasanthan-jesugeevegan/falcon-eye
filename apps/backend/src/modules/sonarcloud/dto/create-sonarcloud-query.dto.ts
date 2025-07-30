import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsIn,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export const ALLOWED_METRICS = ['pull_request', 'project_status'] as const;
type MetricType = (typeof ALLOWED_METRICS)[number];

export class CreateSonarCloudQueryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(ALLOWED_METRICS, { each: true })
  metric: MetricType[];

  @IsNotEmpty()
  @IsUUID()
  sonarCloudConfigId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

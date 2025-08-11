import { IsString, IsObject, IsOptional } from 'class-validator';

export class TriggerWorkflowDto {
  @IsOptional()
  @IsString()
  ref?: string;

  @IsObject()
  inputs: Record<string, any>;

  @IsOptional()
  @IsString()
  triggeredBy?: string;
}

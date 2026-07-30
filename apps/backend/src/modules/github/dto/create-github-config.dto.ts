import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Define the structure for workflow input options
export class WorkflowInputOption {
  @IsString()
  value: string;

  @IsString()
  label: string;
}

// Define the structure for workflow input schema
export class WorkflowInputSchema {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  type: 'string' | 'select' | 'boolean' | 'number';

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowInputOption)
  options?: WorkflowInputOption[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;
}

export class CreateGithubConfigDto {
  @IsString()
  owner: string;

  @IsString()
  repo: string;

  @IsString()
  workflow: string;

  @IsString()
  pat: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowInputSchema)
  inputsSchema: WorkflowInputSchema[];

  @IsOptional()
  @IsString()
  defaultRef?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

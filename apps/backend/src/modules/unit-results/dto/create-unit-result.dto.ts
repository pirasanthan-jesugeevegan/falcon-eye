import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitResultDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsNotEmpty()
  @IsString()
  commit: string;

  @IsNotEmpty()
  @IsString()
  pullRequest: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  statementCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  functionCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  branchCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  lineCoverage: number;

  @IsNotEmpty()
  @IsString()
  author: string;
}

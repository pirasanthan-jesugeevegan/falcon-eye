import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
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
  percentage: number;

  @IsNotEmpty()
  @IsString()
  commit: string;

  @IsNotEmpty()
  @IsString()
  pullRequest: string;

  @IsNotEmpty()
  @IsNumber()
  statementCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  functionCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  branchCoverage: number;

  @IsNotEmpty()
  @IsNumber()
  lineCoverage: number;

  @IsNotEmpty()
  @IsString()
  author: string;
}

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateE2EResultDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pass: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fail: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  skip: number;

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  reportUrl: string;

  @IsNotEmpty()
  @IsString()
  environment: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsNotEmpty()
  @IsString()
  tag: string;
}

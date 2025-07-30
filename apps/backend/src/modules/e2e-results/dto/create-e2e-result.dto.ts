import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
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
  pass: number;

  @IsNotEmpty()
  @IsNumber()
  fail: number;

  @IsNotEmpty()
  @IsNumber()
  skip: number;

  @IsNotEmpty()
  @IsString()
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

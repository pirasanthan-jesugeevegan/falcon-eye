import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UnitResultsService } from './unit-results.service';
import { CreateUnitResultDto } from './dto/create-unit-result.dto';

@Controller('unit-results')
export class UnitResultsController {
  constructor(private readonly unitResultsService: UnitResultsService) {}

  // Create a new unit test result
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUnitResultDto: CreateUnitResultDto) {
    return this.unitResultsService.create(createUnitResultDto);
  }

  // Get all unit test results, or filter by productName
  @Get()
  findAll(@Query('productName') productName?: string) {
    // If productName is provided as a query parameter, filter results by it
    if (productName) {
      return this.unitResultsService.findByProductName(productName); // Use productName to filter
    }
    return this.unitResultsService.findAll(); // If no productName, fetch all unit results
  }

  // Get a single unit test result by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitResultsService.findOne(id);
  }
}

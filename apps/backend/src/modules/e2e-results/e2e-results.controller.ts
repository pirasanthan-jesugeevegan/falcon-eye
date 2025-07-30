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
import { E2EResultsService } from './e2e-results.service';
import { CreateE2EResultDto } from './dto/create-e2e-result.dto';

@Controller('e2e-results')
export class E2EResultsController {
  constructor(private readonly e2eResultsService: E2EResultsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createE2EResultDto: CreateE2EResultDto) {
    return this.e2eResultsService.create(createE2EResultDto);
  }

  @Get()
  findAll(@Query('productName') productName?: string) {
    if (productName) {
      return this.e2eResultsService.findByProductName(productName);
    }
    return this.e2eResultsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.e2eResultsService.findOne(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitResultsController } from './unit-results.controller';
import { UnitResultsService } from './unit-results.service';
import { UnitResult } from './entities/unit-result.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([UnitResult]), ProductsModule],
  controllers: [UnitResultsController],
  providers: [UnitResultsService],
  exports: [UnitResultsService],
})
export class UnitResultsModule {}

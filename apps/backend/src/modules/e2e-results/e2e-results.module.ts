import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { E2EResultsController } from './e2e-results.controller';
import { E2EResultsService } from './e2e-results.service';
import { E2EResult } from './entities/e2e-result.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([E2EResult]), ProductsModule],
  controllers: [E2EResultsController],
  providers: [E2EResultsService],
  exports: [E2EResultsService],
})
export class E2EResultsModule {}

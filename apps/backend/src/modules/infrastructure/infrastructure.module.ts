import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureService } from './infrastructure.service';
import { InfrastructureController } from './infrastructure.controller';
import { Infrastructure } from './entities/infrastructure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Infrastructure])],
  controllers: [InfrastructureController],
  providers: [InfrastructureService],
  exports: [InfrastructureService],
})
export class InfrastructureModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Infrastructure } from './entities/infrastructure.entity';
import { CreateInfrastructureDto } from './dto/create-infrastructure.dto';
import { UpdateInfrastructureDto } from './dto/update-infrastructure.dto';

@Injectable()
export class InfrastructureService {
  constructor(
    @InjectRepository(Infrastructure)
    private readonly infrastructureRepository: Repository<Infrastructure>,
  ) {}

  async create(
    createInfrastructureDto: CreateInfrastructureDto,
  ): Promise<Infrastructure> {
    const infrastructure = this.infrastructureRepository.create(
      createInfrastructureDto,
    );
    return this.infrastructureRepository.save(infrastructure);
  }

  async findAll(): Promise<Infrastructure[]> {
    return this.infrastructureRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Infrastructure> {
    const infrastructure = await this.infrastructureRepository.findOne({
      where: { id },
    });

    if (!infrastructure) {
      throw new NotFoundException(`Infrastructure with ID ${id} not found`);
    }

    return infrastructure;
  }

  async update(
    id: string,
    updateInfrastructureDto: UpdateInfrastructureDto,
  ): Promise<Infrastructure> {
    const infrastructure = await this.findOne(id);

    Object.assign(infrastructure, updateInfrastructureDto);

    return this.infrastructureRepository.save(infrastructure);
  }

  async remove(id: string): Promise<void> {
    const infrastructure = await this.findOne(id);
    await this.infrastructureRepository.remove(infrastructure);
  }
}

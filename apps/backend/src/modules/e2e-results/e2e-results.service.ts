import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { E2EResult } from './entities/e2e-result.entity';
import { CreateE2EResultDto } from './dto/create-e2e-result.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class E2EResultsService {
  constructor(
    @InjectRepository(E2EResult)
    private e2eResultsRepository: Repository<E2EResult>,
    private productsService: ProductsService,
  ) {}

  // Fetch all E2E test results
  async findAll(): Promise<E2EResult[]> {
    return this.e2eResultsRepository.find({
      relations: ['product'],
      order: { timestamp: 'DESC' },
    });
  }

  // Fetch a single E2E test result by ID
  async findOne(id: string): Promise<E2EResult> {
    const result = await this.e2eResultsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!result) {
      throw new NotFoundException(`E2E Result with ID ${id} not found`);
    }

    return result;
  }

  // Fetch E2E test results by productName (updated from productId)
  async findByProductName(productName: string): Promise<E2EResult[]> {
    return this.e2eResultsRepository.find({
      where: { product: { productName } }, // Filter by productName instead of productId
      relations: ['product'],
      order: { timestamp: 'DESC' },
    });
  }

  // Create a new E2E test result
  async create(createE2EResultDto: CreateE2EResultDto): Promise<E2EResult> {
    // Verify if the product exists using productName instead of product_id
    const product = await this.productsService.findByName(
      createE2EResultDto.productName,
    ); // Updated to use productName

    if (!product) {
      throw new NotFoundException(
        `Product with name '${createE2EResultDto.productName}' not found`,
      );
    }

    // Calculate the status based on the number of failed tests
    const status = createE2EResultDto.fail > 0 ? 'failed' : 'passed';

    const e2eResult = this.e2eResultsRepository.create({
      ...createE2EResultDto,
      product,
      status, // Set the status here
    });

    return this.e2eResultsRepository.save(e2eResult);
  }
}

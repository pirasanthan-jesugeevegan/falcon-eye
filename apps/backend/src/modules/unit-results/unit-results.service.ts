import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitResult } from './entities/unit-result.entity';
import { CreateUnitResultDto } from './dto/create-unit-result.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class UnitResultsService {
  constructor(
    @InjectRepository(UnitResult)
    private unitResultsRepository: Repository<UnitResult>,
    private productsService: ProductsService,
  ) {}

  // Fetch all unit test results
  async findAll(): Promise<UnitResult[]> {
    return this.unitResultsRepository.find({
      relations: ['product'],
    });
  }

  // Fetch a single unit test result by ID
  async findOne(id: string): Promise<UnitResult> {
    const result = await this.unitResultsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!result) {
      throw new NotFoundException(`Unit Result with ID ${id} not found`);
    }

    return result;
  }

  // Fetch unit test results by productName
  async findByProductName(productName: string): Promise<any[]> {
    // Fetch unit test results for a specific product
    const rawData = await this.unitResultsRepository.find({
      where: { product: { productName } },
      relations: ['product'],
    });

    // Group the results by pull_request
    return rawData.reduce((acc: any[], item: any) => {
      const existingItem = acc.find(
        (groupedItem: { pull_request: string }) =>
          groupedItem.pull_request === item.pull_request,
      );

      // If an item with the same pull_request exists, push the result to that item
      if (existingItem) {
        existingItem.result.push({
          id: item.id,
          date: item.date,
          commit: item.commit,
          percentage: item.percentage,
          statement_coverage: item.statement_coverage,
          function_coverage: item.function_coverage,
          branch_coverage: item.branch_coverage,
          line_coverage: item.line_coverage,
          author: item.author,
        });
      } else {
        // If no item with that pull_request exists, create a new entry
        acc.push({
          id: item.id,
          pull_request: item.pull_request,
          result: [
            {
              id: item.id,
              date: item.date,
              commit: item.commit,
              percentage: item.percentage,
              statement_coverage: item.statement_coverage,
              function_coverage: item.function_coverage,
              branch_coverage: item.branch_coverage,
              line_coverage: item.line_coverage,
              author: item.author,
            },
          ],
        });
      }

      return acc;
    }, []);
  }

  // Create a new unit test result
  async create(createUnitResultDto: CreateUnitResultDto): Promise<UnitResult> {
    // Verify if the product exists using productName
    const product = await this.productsService.findByName(
      createUnitResultDto.productName,
    ); // Updated to use productName

    if (!product) {
      throw new NotFoundException(
        `Product with name ${createUnitResultDto.productName} not found`,
      );
    }

    // Create the unit result entity
    const { productName, ...rest } = createUnitResultDto; // eslint-disable-line @typescript-eslint/no-unused-vars
    const unitResult = this.unitResultsRepository.create({
      ...rest,
      percentage: String(rest.percentage),
      statementCoverage: String(rest.statementCoverage),
      functionCoverage: String(rest.functionCoverage),
      branchCoverage: String(rest.branchCoverage),
      lineCoverage: String(rest.lineCoverage),
      product, // Pass the entire Product object here
    });

    return this.unitResultsRepository.save(unitResult);
  }
}

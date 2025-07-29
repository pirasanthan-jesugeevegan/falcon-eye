import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // Fetch all products
  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  // Fetch a single product by its ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // Fetch a product by its productName
  async findByName(productName: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { productName },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with name '${productName}' not found`,
      );
    }
    return product;
  }

  // Create a new product
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOne({
      where: { productName: createProductDto.productName },
    });
    if (existingProduct) {
      throw new NotFoundException(
        `Product with name '${createProductDto.productName}' already exists`,
      );
    }

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  // Update an existing product
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  // Remove a product
  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  let mockRepository: Partial<Repository<Product>>;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Test Product',
        icon: 'https://test.com',
        path: 'https://test.com',
        isActive: true,
      };

      const expectedProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the repository methods
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null); // No existing product
      (mockRepository.create as jest.Mock).mockReturnValue(expectedProduct);
      (mockRepository.save as jest.Mock).mockResolvedValue(expectedProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productName: createProductDto.productName },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedProduct);
    });

    it('should throw NotFoundException when product already exists', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Existing Product',
        icon: 'https://test.com',
        path: 'https://test.com',
        isActive: true,
      };

      const existingProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingProduct);

      await expect(controller.create(createProductDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productName: createProductDto.productName },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts = [
        {
          id: '1',
          productName: 'Product 1',
          icon: 'https://test1.com',
          path: 'https://test1.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          productName: 'Product 2',
          icon: 'https://test2.com',
          path: 'https://test2.com',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRepository.find as jest.Mock).mockResolvedValue(expectedProducts);

      const result = await controller.findAll();

      expect(result).toEqual(expectedProducts);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no products exist', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      const productId = '1';
      const expectedProduct = {
        id: productId,
        productName: 'Test Product',
        icon: 'https://test.com',
        path: 'https://test.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(expectedProduct);

      const result = await controller.findOne(productId);

      expect(result).toEqual(expectedProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = '999';

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(controller.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const productId = '1';
      const updateProductDto: UpdateProductDto = {
        productName: 'Updated Product',
        icon: 'https://updated.com',
        isActive: false,
      };

      const existingProduct = {
        id: productId,
        productName: 'Original Product',
        icon: 'https://original.com',
        path: 'https://original.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(existingProduct) // First call for findOne
        .mockResolvedValueOnce(updatedProduct); // Second call for save
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProduct);
    });

    it('should throw NotFoundException when product to update not found', async () => {
      const productId = '999';
      const updateProductDto: UpdateProductDto = {
        productName: 'Updated Product',
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing product', async () => {
      const productId = '1';

      (mockRepository.delete as jest.Mock).mockResolvedValue({
        affected: 1,
      });

      await controller.remove(productId);

      expect(mockRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when product to remove not found', async () => {
      const productId = '999';

      (mockRepository.delete as jest.Mock).mockResolvedValue({
        affected: 0,
      });

      await expect(controller.remove(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});

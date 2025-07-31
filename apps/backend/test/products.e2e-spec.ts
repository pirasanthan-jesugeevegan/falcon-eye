import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProductsModule } from '../src/modules/products/products.module';
import { Product } from '../src/modules/products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Products API (e2e)', () => {
  let app: INestApplication;
  let mockRepository: Partial<Repository<Product>>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductsModule],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue(mockRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        productName: 'Test Product',
        icon: 'https://test.com/icon.png',
        path: 'https://test.com',
        isActive: true,
      };

      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
      (mockRepository.create as jest.Mock).mockReturnValue(mockProduct);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(response.body.productName).toBe(createProductDto.productName);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productName: createProductDto.productName },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 when creating product with duplicate name', async () => {
      const createProductDto = {
        productName: 'Duplicate Product',
        icon: 'https://test.com/icon.png',
        path: 'https://test.com',
        isActive: true,
      };

      const existingProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingProduct);

      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(404);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productName: createProductDto.productName },
      });
    });
  });

  describe('/products (GET)', () => {
    it('should return empty array when no products exist', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return all products', async () => {
      const mockProducts = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          productName: 'Product 1',
          icon: 'https://test.com/icon1.png',
          path: 'https://test.com/1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          productName: 'Product 2',
          icon: 'https://test.com/icon2.png',
          path: 'https://test.com/2',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockRepository.find as jest.Mock).mockResolvedValue(mockProducts);

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].productName).toBe('Product 1');
      expect(response.body[1].productName).toBe('Product 2');
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a single product by id', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const mockProduct = {
        id: productId,
        productName: 'Single Product',
        icon: 'https://test.com/icon.png',
        path: 'https://test.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body.productName).toBe('Single Product');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should return 404 when product not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/products/${nonExistentId}`)
        .expect(404);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update an existing product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto = {
        productName: 'Updated Product',
        isActive: false,
      };

      const existingProduct = {
        id: productId,
        productName: 'Original Product',
        icon: 'https://test.com/icon.png',
        path: 'https://test.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
        updatedAt: new Date(),
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingProduct);
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const response = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send(updateProductDto)
        .expect(200);

      expect(response.body.productName).toBe(updateProductDto.productName);
      expect(response.body.isActive).toBe(updateProductDto.isActive);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProduct);
    });

    it('should return 404 when updating non-existent product', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto = {
        productName: 'Updated Product',
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch(`/products/${nonExistentId}`)
        .send(updateProductDto)
        .expect(404);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete an existing product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock the delete method to return success
      (mockRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      expect(mockRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock the delete method to return no affected rows
      (mockRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await request(app.getHttpServer())
        .delete(`/products/${nonExistentId}`)
        .expect(404);

      expect(mockRepository.delete).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Full CRUD workflow', () => {
    it('should handle complete CRUD operations', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      // CREATE
      const createProductDto = {
        productName: 'Workflow Product',
        icon: 'https://workflow.com/icon.png',
        path: 'https://workflow.com',
        isActive: true,
      };

      const mockProduct = {
        id: productId,
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRepository.create as jest.Mock).mockReturnValue(mockProduct);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockProduct);
      (mockRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // For create check (no existing product)
        .mockResolvedValueOnce(mockProduct) // For read
        .mockResolvedValueOnce(mockProduct); // For update check

      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(createResponse.body.productName).toBe(
        createProductDto.productName,
      );

      // READ
      const readResponse = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(readResponse.body.productName).toBe(createProductDto.productName);

      // UPDATE
      const updateProductDto = {
        productName: 'Updated Workflow Product',
        isActive: false,
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateProductDto,
        updatedAt: new Date(),
      };

      (mockRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const updateResponse = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send(updateProductDto)
        .expect(200);

      expect(updateResponse.body.productName).toBe(
        updateProductDto.productName,
      );
      expect(updateResponse.body.isActive).toBe(updateProductDto.isActive);

      // DELETE
      (mockRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      // Verify all repository methods were called
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledTimes(2); // Create and update
      expect(mockRepository.findOne).toHaveBeenCalledTimes(3); // Create check, read, update check
      expect(mockRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ProductsService } from '../../modules/products/products.service';
import { E2EResultsService } from '../../modules/e2e-results/e2e-results.service';
import { UnitResultsService } from '../../modules/unit-results/unit-results.service';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get our services
  const productsService = app.get(ProductsService);
  const e2eResultsService = app.get(E2EResultsService);
  const unitResultsService = app.get(UnitResultsService);

  try {
    console.log('Seeding database...');

    // Create sample products
    const products = await Promise.all([
      productsService.create({
        productName: 'Frontend App',
        icon: 'https://cdn.example.com/icons/frontend.png',
        path: '/frontend',
      }),
      productsService.create({
        productName: 'Backend API',
        icon: 'https://cdn.example.com/icons/backend.png',
        path: '/backend',
      }),
      productsService.create({
        productName: 'Mobile App',
        icon: 'https://cdn.example.com/icons/mobile.png',
        path: '/mobile',
      }),
    ]);

    console.log(`Created ${products.length} products`);

    // Create sample E2E results
    const e2eResults = [];
    for (const product of products) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Create multiple E2E test results for each product with different dates
      for (let i = 0; i < 5; i++) {
        const date = new Date(lastMonth);
        date.setDate(date.getDate() + i * 6); // Spread tests over last month

        const totalTests = 100 + Math.floor(Math.random() * 50);
        const passedTests = Math.floor(
          totalTests * (0.75 + Math.random() * 0.2),
        );
        const failedTests = Math.floor((totalTests - passedTests) * 0.7);
        const skippedTests = totalTests - passedTests - failedTests;

        e2eResults.push(
          await e2eResultsService.create({
            productName: product.productName, // Correctly passing productName
            timestamp: date,
            pass: passedTests,
            fail: failedTests,
            skip: skippedTests,
            duration: (60000 + Math.floor(Math.random() * 120000)).toString(),
            reportUrl: `https://reports.example.com/e2e/${uuidv4()}`,
            environment: i % 2 === 0 ? 'DEV' : 'PROD',
            tag: i % 2 === 0 ? 'Regression' : 'Smoke',
          }),
        );
      }
    }

    console.log(`Created ${e2eResults.length} E2E test results`);

    // Create sample Unit results
    const unitResults = [];
    for (const product of products) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Create multiple Unit test results for each product with different dates
      for (let i = 0; i < 5; i++) {
        const date = new Date(lastMonth);
        date.setDate(date.getDate() + i * 6); // Spread tests over last month

        const totalTests = 200 + Math.floor(Math.random() * 100);
        const passedTests = Math.floor(
          totalTests * (0.85 + Math.random() * 0.1),
        );

        unitResults.push(
          await unitResultsService.create({
            productName: product.productName, // Correctly passing productName
            date: date,
            percentage: parseFloat(
              ((passedTests / totalTests) * 100).toFixed(2),
            ),
            commit: `commit-${uuidv4().substring(0, 8)}`,
            pullRequest: `pr-${uuidv4().substring(0, 8)}`,
            statementCoverage: 80 + Math.floor(Math.random() * 15),
            functionCoverage: 75 + Math.floor(Math.random() * 20),
            branchCoverage: 70 + Math.floor(Math.random() * 20),
            lineCoverage: 80 + Math.floor(Math.random() * 15),
            author: 'Author Name',
          }),
        );
      }
    }

    console.log(`Created ${unitResults.length} Unit test results`);
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error while seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

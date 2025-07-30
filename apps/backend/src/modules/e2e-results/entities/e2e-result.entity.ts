import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('e2e_results')
export class E2EResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign Key to the Product table
  @ManyToOne(() => Product, (product) => product.productName)
  @JoinColumn({ name: 'product_id' }) // Changed to 'product_id' to match common naming conventions
  product: Product;

  @Column({ type: 'varchar', length: 10 })
  status: 'passed' | 'failed' | 'skipped';

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'int' })
  pass: number;

  @Column({ type: 'int' })
  fail: number;

  @Column({ type: 'int' })
  skip: number;

  @Column({ type: 'text' })
  reportUrl: string;

  @Column({ type: 'varchar', length: 50 })
  environment: string;

  @Column({ type: 'varchar', length: 50 })
  duration: string;

  @Column({ type: 'varchar', length: 50 })
  tag: string;
}

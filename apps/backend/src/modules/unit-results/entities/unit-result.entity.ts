import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('unit_results')
export class UnitResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign Key to Product
  @ManyToOne(() => Product, (product) => product.productName, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  percentage: string;

  @Column()
  commit: string;

  @Column()
  pullRequest: string;

  @Column()
  statementCoverage: string;

  @Column()
  functionCoverage: string;

  @Column()
  branchCoverage: string;

  @Column()
  lineCoverage: string;

  @Column()
  author: string;
}

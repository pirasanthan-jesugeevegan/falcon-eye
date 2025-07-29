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

  @ManyToOne(() => Product, (product) => product.productName, { eager: true })
  @JoinColumn({ name: 'productName' })
  productName: Product;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  percentage: string;

  @Column()
  commit: string;

  @Column()
  pull_request: string;

  @Column()
  statement_coverage: string;

  @Column()
  function_coverage: string;

  @Column()
  branch_coverage: string;

  @Column()
  line_coverage: string;

  @Column()
  author: string;

  // Relationships
  @ManyToOne(() => Product, (product) => product.unit_results)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

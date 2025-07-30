import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { E2EResult } from '../../e2e-results/entities/e2e-result.entity';
import { UnitResult } from '../../unit-results/entities/unit-result.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  path: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => E2EResult, (e2eResult) => e2eResult.product)
  e2eResults: E2EResult[];

  @OneToMany(() => UnitResult, (unitResult) => unitResult.product)
  unitResults: UnitResult[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SonarCloudConfig } from './sonarcloud-config.entity';

@Entity('sonarcloud_queries')
export class SonarCloudQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  project: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column('text', { array: true })
  metric: string[];

  @ManyToOne(() => SonarCloudConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sonarCloudConfigId' })
  sonarCloudConfig: SonarCloudConfig;

  @Column()
  sonarCloudConfigId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jira_config')
export class JiraConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  instanceName: string;

  @Column()
  baseUrl: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  @Exclude()
  encryptedApiToken: string;

  @Column({ nullable: true })
  projectKey: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

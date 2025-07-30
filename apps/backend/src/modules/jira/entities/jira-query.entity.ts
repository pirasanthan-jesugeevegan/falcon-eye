import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JiraConfig } from './jira-config.entity';

@Entity('jira_queries')
export class JiraQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  jqlQuery: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToOne(() => JiraConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jiraConfigId' })
  jiraConfig: JiraConfig;

  @Column()
  jiraConfigId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

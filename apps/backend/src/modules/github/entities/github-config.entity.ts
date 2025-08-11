import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'github_configs' })
export class GithubConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner: string;

  @Column()
  repo: string;

  @Column()
  workflow: string;

  @Column('text')
  encryptedPat: string;

  @Column({ type: 'jsonb' })
  inputsSchema: any[];

  @Column({ default: 'main' })
  defaultRef: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

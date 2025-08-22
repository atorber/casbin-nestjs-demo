import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StoragePath } from './storage-path.entity';

export enum StorageInstanceType {
  LOCAL = 'local',
  S3 = 's3',
  MINIO = 'minio',
  ALIYUN_OSS = 'aliyun_oss',
  TENCENT_COS = 'tencent_cos',
  QINIU = 'qiniu',
}

@Entity('storage_instances')
export class StorageInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: StorageInstanceType,
    default: StorageInstanceType.LOCAL,
  })
  type: StorageInstanceType;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdById: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StoragePath, (storagePath) => storagePath.storageInstance)
  storagePaths: StoragePath[];
}

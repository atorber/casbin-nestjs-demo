import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StorageInstance } from './storage-instance.entity';
import { StoragePermissionEntity } from './storage-permission.entity';

@Entity('storage_paths')
export class StoragePath {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  path: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  storageInstanceId: number;

  @ManyToOne(() => StorageInstance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storageInstanceId' })
  storageInstance: StorageInstance;

  @Column()
  createdById: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => StoragePermissionEntity,
    (permission) => permission.storagePath,
  )
  permissions: StoragePermissionEntity[];
}

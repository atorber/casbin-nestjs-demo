import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StoragePath, StoragePermission } from './storage-path.entity';

@Entity('storage_permissions')
@Unique(['userId', 'storagePathId'])
export class StoragePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  storagePathId: number;

  @ManyToOne(() => StoragePath)
  @JoinColumn({ name: 'storagePathId' })
  storagePath: StoragePath;

  @Column({
    type: 'varchar',
    enum: StoragePermission,
    default: StoragePermission.READ
  })
  permission: StoragePermission;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  grantedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE', nullable: true })
  user: User;
}

import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from '../../chats/entities/chat.entity.js';
import { Company } from '../../companies/entities/company.entity.js';
import { Notification } from '../../notifications/entities/notification.entity.js';

export type UserRole = 'admin' | 'supervisor' | 'support' | 'agent' | 'system';
export type UserStatue = 'online' | 'offline' | 'busy';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  firstNames?: string;

  @Column({ length: 255, nullable: true })
  lastNames?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatar?: string;

  @Column()
  password: string;

  @Column({ default: 'agent' })
  role: UserRole;

  @Column({ default: 'offline' })
  status: UserStatue;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Chat, chat => chat.assignedAgent)
  chats: Chat[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[]

  // Hash password before inserting into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // cost factor: 10
  }
}

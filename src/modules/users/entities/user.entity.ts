import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // cost factor: 10
  }
}

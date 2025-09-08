import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Contact } from '../../contacts/entities/contact.entity.js';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'tinyint', default: 0, nullable: false })
  isActive: boolean;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation with Contact entity
  @OneToMany(() => Contact, (contact) => contact.assignedTo)
  contacts: Contact[];

  // Hash password before inserting into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // cost factor: 10
  }
}

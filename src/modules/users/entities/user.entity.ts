import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from '../../companies/entities/company.entity.js';
import { Contact } from '../../contacts/entities/contact.entity.js';

export type UserRole = 'admin' | 'manager' | 'support' | 'agent';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  firstName?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ length: 255, nullable: true })
  lastName?: string;

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

  @Column({ type: 'tinyint', default: 0, nullable: false })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation with Contact entity
  @OneToMany(() => Contact, (contact) => contact.assignedTo)
  contacts: Contact[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Hash password before inserting into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // cost factor: 10
  }
}

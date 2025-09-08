import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { CustomerStatus, ContactSource } from "../contact.enum";

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.NEW })
  customerStatus: CustomerStatus;

  @Column({ type: 'enum', enum: ContactSource, default: ContactSource.MANUAL })
  source: ContactSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  // Relation with User entity
  @ManyToOne(() => User, (user) => user.contacts, { nullable: true })
  assignedTo: User;
}

import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from "../../chats/entities";
import { User } from "../../users/entities/user.entity";
import { ContactStatus } from "../contact.enum";

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.NEW })
  status: ContactStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date

  // Relation with User entity
  @ManyToOne(() => User, (user) => user.contacts, { nullable: true, onDelete: 'SET NULL' })
  assignedTo: User;

  @ManyToOne(() => Chat, (chat) => chat.contact, { nullable: true, onDelete: 'SET NULL' })
  chat: Chat
}

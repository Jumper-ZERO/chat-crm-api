import { Message } from "src/modules/chats/entities/message.entity";
import { Transfer } from "src/modules/chats/entities/transfer.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Contact } from "../../contacts/entities/contact.entity";

export type ChatStatus = 'open' | 'transferred' | 'closed';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contact, (contact) => contact.chat)
  contact: Contact;

  @ManyToOne(() => User, { nullable: true })
  assignedUser: User;

  @Column({ default: 'open' })
  status: ChatStatus;

  @Column({ type: 'datetime', nullable: true })
  endedAt: Date;

  @OneToMany(() => Message, (msg) => msg.session)
  messages: Message[];

  @OneToMany(() => Transfer, (t) => t.chat)
  transfers: Transfer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}
import { Chat } from "src/modules/chats/entities/chat.entity";
import { User } from "src/modules/users/entities/user.entity";
import { CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat)
  chat: Chat;

  @ManyToOne(() => User)
  fromAgent: User;

  @ManyToOne(() => User)
  toAgent: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}
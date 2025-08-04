import { ChatSession } from "src/modules/chats/entities/chat-session.entity";
import { ClientDetail } from "src/modules/clients/entities/client-details.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  waId: string;

  @Column()
  phoneNumer: string;
  
  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  languageCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ClientDetail, (detail) => detail.client)
  details: ClientDetail[];

  @OneToMany(() => ChatSession, (chat) => chat.client)
  chatSessions: ChatSession[];
}

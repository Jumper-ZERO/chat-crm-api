import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "../../chats/entities";

@Entity()
export class SentimentAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (m) => m.analysis, { onDelete: 'CASCADE' })
  message: Message;

  @Column({ type: 'enum', enum: ['NEG', 'NEU', 'POS'] })
  label: 'NEG' | 'NEU' | 'POS';

  @Column('float')
  neg: number;

  @Column('float')
  neu: number;

  @Column('float')
  pos: number;

  @Column({ nullable: true })
  model: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

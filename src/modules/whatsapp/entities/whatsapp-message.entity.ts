import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageId: string;

  @Column()
  phoneNumber: string;

  @Column()
  direction: string; // INBOUND, OUTBOUND

  @Column()
  messageType: string; // text, image, document, template, etc.

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ default: 'SENT' })
  status: string; // SENT, DELIVERED, READ, FAILED

  @Column()
  businessId: string;

  @CreateDateColumn()
  timestamp: Date;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('whatsapp_configs')
export class WhatsAppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  businessId: string;

  @Column()
  accessToken: string;

  @Column()
  phoneNumberId: string;

  @Column()
  webhookUrl: string;

  @Column()
  verifyToken: string;

  @Column({ type: "varchar", default: "v18.0" })
  apiVersion: string;

  @Column({ type: "varchar", default: "https://graph.facebook.com" })
  apiBaseUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column('json', { nullable: true })
  webhookEvents: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
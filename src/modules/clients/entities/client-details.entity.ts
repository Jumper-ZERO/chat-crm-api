import { Client } from "src/modules/clients/entities/client.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('client_details')
export class ClientDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column('text')
  value: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  collectAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.details, { onDelete: 'CASCADE' })
  client: Client;
}
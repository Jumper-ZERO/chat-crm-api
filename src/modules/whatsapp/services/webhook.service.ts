/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WhatsappNotification, WhatsappNotificationContact, WhatsappNotificationMessage } from "@daweto/whatsapp-api-types";
import { PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";
import { WhatsAppConfigService } from "./whatsapp-config.service";
import { ChatsService } from "../../chats/chats.service";
import { Message } from "../../chats/entities";
import { ContactsService } from "../../contacts/contacts.service";
import { UsersService } from "../../users/users.service";
import { WhatsappGateway } from "../whatsapp.gateway";

@Injectable()
export class WebhookService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: WhatsAppConfigService,
    private readonly contactService: ContactsService,
    private readonly chatService: ChatsService,
    private readonly userService: UsersService,
    private readonly whatsappGateway: WhatsappGateway,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) { }

  async handleIncomingMessage(payload: WhatsappNotification) {
    const { entry, object } = payload
    this.logger.debug(`Received webhook: \n${JSON.stringify(payload, null, 2)}`);
    if (object !== 'whatsapp_business_account') return;

    for (const data of entry) {
      const { company } = await this.configService.findByBusinessId(data.id); // id == Company.businessId

      this.logger.debug(`Processing webhook for company: ${data.id})`);

      for (const change of data.changes ?? []) {
        for (const message of change.value.messages ?? []) {
          const senderWaId = message.from;
          const contact = change.value.contacts?.find(c => c.wa_id === senderWaId);
          void this.processMessage(message, contact, company.id);
        }
      }
    }
  }

  async processMessage(
    message: WhatsappNotificationMessage,
    notifyContact: WhatsappNotificationContact | undefined,
    companyId: string
  ) {
    const { from: phoneNumber, type } = message;

    const contact = await this.contactService.findOrCreateByPhone(
      phoneNumber,
      companyId,
      notifyContact
    );

    const agent = await this.userService.findAvailableAgent(companyId);
    const chat = await this.chatService.findOrCreateByContact(
      agent.id,
      contact.id,
      agent.role === 'system'
    );

    let savedMsg: Message | null = null;

    const msg: Partial<Message> = {
      waMessageId: message.id,
      chat: chat,
      contact: contact,
      direction: 'in',
      status: 'received',
      senderType: 'client',
    };

    switch (type) {
      case 'text':
        if (message.text?.body) {
          msg.body = message.text.body;
          this.logger.debug(`Saving message from ${phoneNumber}: ${msg.body}`);
          savedMsg = await this.messageRepo.save(msg);

          this.logger.debug(`Emitting to agent ${JSON.stringify(chat)} message from ${phoneNumber}: ${msg.body}`);
        }
        break;
    }

    if (savedMsg) {
      void this.chatService.updateLastMessage(chat.id, savedMsg.id);
      this.whatsappGateway.server.to(chat.id).emit('new-message', savedMsg);
    }
  }
}
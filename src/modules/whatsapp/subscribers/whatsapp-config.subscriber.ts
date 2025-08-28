import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { WhatsAppConfig } from "../entities";

@EventSubscriber()
export class WhatsAppConfigSubscriber implements EntitySubscriberInterface<WhatsAppConfig> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof WhatsAppConfig {
    return WhatsAppConfig
  }

  async beforeInsert(event: InsertEvent<WhatsAppConfig>): Promise<void> {
    const isActive = event.entity.isActive ?? true;
    console.log(isActive)

    if (isActive) {
      await event.manager
        .createQueryBuilder()
        .update(WhatsAppConfig)
        .set({ isActive: false })
        .where('isActive = :active', { active: true })
        .execute();
    }
  }

  async afterUpdate(event: UpdateEvent<WhatsAppConfig>): Promise<void> {
    const newConfig: WhatsAppConfig | undefined = event?.entity as WhatsAppConfig | undefined;

    if (newConfig?.isActive) {
      await event.manager
        .createQueryBuilder()
        .update(WhatsAppConfig)
        .set({ isActive: false })
        .where('isActive = :active', { active: true })
        .andWhere('id != :id', { id: newConfig?.id })
        .execute();
    }
  }
}
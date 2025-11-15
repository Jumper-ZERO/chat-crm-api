import { BullRootModuleOptions } from "@nestjs/bullmq";

export const bullmqConfig: BullRootModuleOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  }
}
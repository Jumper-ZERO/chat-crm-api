import { createZodDto } from "nestjs-zod";
import { MessageSchema } from "../schemas/message.schema";

export class CreateMessageDto extends createZodDto(
  MessageSchema.omit({ id: true, createdAt: true })
) { }

export class UpdateMessageDto extends createZodDto(
  MessageSchema.partial().omit({ id: true, createdAt: true })
) { }

export class MessageResponseDto extends createZodDto(MessageSchema) { }
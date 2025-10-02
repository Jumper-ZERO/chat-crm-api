import { createZodDto } from "nestjs-zod";
import { ChatSchema } from "../schemas/chat.schema";

export class CreateChatDto extends createZodDto(
  ChatSchema.omit({ id: true, lastMessageId: true, createdAt: true })
) { }

export class UpdateChatDto extends createZodDto(
  ChatSchema.partial().omit({ id: true, createdAt: true })
) { }

export class ChatResponseDto extends createZodDto(ChatSchema) { }
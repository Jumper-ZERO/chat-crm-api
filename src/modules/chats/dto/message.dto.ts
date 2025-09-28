import { PartialType } from "@nestjs/mapped-types";

export class CreateChatMessageDto {
  clientId: number;
  sessionId: number;
  content: string;
  timestamp?: Date;
}

export class UpdateChatMessageDto extends PartialType(CreateChatMessageDto) { }
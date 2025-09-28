import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsUUID } from "class-validator";
import type { ChatStatus } from "../entities/chat.entity";

export class CreateChatDto {
  @IsUUID()
  contactId: string;

  @IsUUID()
  assignedUserId: string;

  @IsOptional()
  status: ChatStatus;
}

export class UpdateChatDto extends PartialType(CreateChatDto) { }
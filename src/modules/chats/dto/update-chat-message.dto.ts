import { PartialType } from "@nestjs/mapped-types";
import { CreateChatMessageDto } from "src/modules/chats/dto/create-chat-message.dto";

export class UpdateChatMessageDto extends PartialType(CreateChatMessageDto) { }

import { PartialType } from "@nestjs/mapped-types";
import { CreateChatSessionDto } from "src/modules/chats/dto/create-chat-session.dto";

export class UpdateChatSessionDto extends PartialType(CreateChatSessionDto) { }
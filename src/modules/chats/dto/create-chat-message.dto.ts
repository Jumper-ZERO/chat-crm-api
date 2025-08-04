export class CreateChatMessageDto {
  clientId: number;
  sessionId: number;
  content: string;
  timestamp?: Date;
}
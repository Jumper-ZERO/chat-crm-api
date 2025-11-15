import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { SentimentService } from "../services/sentiment.service";

@Controller('sentiment')
export class SentimentController {
  constructor(
    private readonly sentimentService: SentimentService
  ) { }

  @Get('/chat/:chatId')
  @HttpCode(HttpStatus.OK)
  async getGlobalChatSentiment(@Param('chatId') chatId: string) {
    return this.sentimentService.getGlobalChatSentiment(chatId)
  }
}
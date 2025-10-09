import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatsService } from '../chats.service';
import { CreateChatDto, UpdateChatDto } from '../dto/chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly service: ChatsService) { }

  @Post()
  create(@Body() dto: CreateChatDto) {
    return this.service.create(dto);
  }

  @Get('/list')
  findAll() {
    return this.service.getChats();
  }

  @Get(':id/messages')
  findMessages(@Param('id') id: string) {
    return this.service.getChatMessages(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.service.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}

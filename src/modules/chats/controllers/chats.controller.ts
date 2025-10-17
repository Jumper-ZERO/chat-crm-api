import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { JwtPayload } from '../../../auth/auth.types';
import { ChatsService } from '../chats.service';
import { CreateChatDto, UpdateChatDto } from '../dto/chat.dto';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private readonly service: ChatsService) { }

  @Post()
  create(@Body() dto: CreateChatDto) {
    return this.service.create(dto);
  }

  @Get('/list')
  findAll(@Req() req: Request) {
    const auth = req.user as JwtPayload;
    return this.service.getChats(auth.sub);
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

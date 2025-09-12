import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import qs from 'qs';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

interface ParsedSort<T> {
  id: keyof T;
  desc: string;
}

export interface ParsedQuery {
  page?: string;
  perPage?: string;
  name?: string;
  sort?: ParsedSort<Contact>[];
  [key: string]: unknown;
}

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactService: ContactsService) { }

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const queryString = req.url.split('?')[1] || '';

    const parsed = qs.parse(queryString, { depth: 10 }) as ParsedQuery;

    return this.contactService.findAll(parsed);
  }

  @Get(':phone')
  findByPhone(@Param('phone') phone: string) {
    return this.contactService.findByPhone(phone);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { contactTableQuerySchema } from '../../common/schemas/contact-table-query.schema';
import { type DataTableBaseQuery } from '../../common/types/data-table.types';

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

  @Get("table")
  @UsePipes(new ZodValidationPipe(contactTableQuerySchema))
  getTable(@Query() query: DataTableBaseQuery) {
    return this.contactService.findPaginated(query);
  }

  @Get()
  findAll() {
    return this.contactService.findAll();
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

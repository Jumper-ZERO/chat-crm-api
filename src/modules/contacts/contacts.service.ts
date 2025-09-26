import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository, UpdateResult } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { ContactTableQueryDto } from '../../common/schemas/contact-table-query.schema';
import { buildQueryOptions } from '../../lib/helpers/build-query-options.helper';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) { }

  async findPaginated(query: ContactTableQueryDto): Promise<Pagination<Contact>> {
    const { findOptions, paginationOptions } = buildQueryOptions(query);

    return paginate<Contact>(
      this.contactRepo,
      paginationOptions,
      findOptions,
    );
  }

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepo.create({
      ...dto,
      assignedTo: { id: dto.assignedTo },
    });

    return this.contactRepo.save(contact);
  }

  async findAll() {
    return this.contactRepo.find()
  }

  async update(id: string, dto: UpdateContactDto): Promise<UpdateResult> {
    return await this.contactRepo.update(id, { ...dto, assignedTo: { id: dto.assignedTo } });
  }

  async remove(id: string): Promise<void> {
    const res = await this.contactRepo.softDelete({ id });
    console.log('Deleting contact with ID:', id);
    console.log(res);
  }

  findByPhone(phone: string): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: { phone },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { FindManyOptions, Repository, UpdateResult } from 'typeorm';
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

    const optionsWithRelations: FindManyOptions<Contact> = {
      ...(findOptions as FindManyOptions<Contact>),
      relations: ['assignedTo'],
    };

    return paginate<Contact>(
      this.contactRepo,
      paginationOptions,
      optionsWithRelations,
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
    return this.contactRepo.find({
      relations: ['assignedTo']
    })
  }

  async update(id: string, dto: UpdateContactDto): Promise<UpdateResult> {
    console.log(dto)
    return await this.contactRepo.update(id, { ...dto, assignedTo: { id: dto.assignedTo } });
  }

  async remove(id: string) {
    const res = await this.contactRepo.softDelete({ id });

    if (res.affected === 0) {
      throw new NotFoundException(`Contacto con id ${id} no encontrado`);
    }

    return { success: true, id }
  }

  findByPhone(phone: string): Promise<Contact | null> {
    return this.contactRepo.findOne({
      where: { phone },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Repository, UpdateResult } from 'typeorm';
import { ParsedQuery } from './contacts.controller';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { QueryBuilderHelper } from '../../lib/helpers/query-builder.helper';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async paginate(options: IPaginationOptions): Promise<Pagination<Contact>> {
    return paginate<Contact>(this.contactRepo, options);
  }

  async create(dto: CreateContactDto): Promise<Contact> {
    let user: User | undefined;

    if (dto.assignedTo)
      user = await this.findUserOrFail(dto.assignedTo);

    const contact = this.contactRepo.create({
      ...dto,
      assignedTo: user,
    });

    return this.contactRepo.save(contact);
  }

  async findAll(query: ParsedQuery): Promise<Pagination<Contact>> {
    const { page, perPage, name, status, sort } = query;
    const { id, desc } = sort?.[0] || {};

    const qb = this.qbContactWithUser()
      .filter(!!name, 'contact.name LIKE LOWER(:name)', { name: `%${name}%` })
      .filter(!!status, 'contact.customerStatus = :status', { status })
      .sort(id, desc === 'true')
      .build();

    return paginate<Contact>(qb, { page: page ?? 1, limit: perPage ?? 10 });
  }

  private qbContactWithUser() {
    const qb = this.contactRepo.createQueryBuilder('contact')
      .leftJoinAndSelect('contact.assignedTo', 'user');

    return new QueryBuilderHelper<Contact>(qb);
  }

  async update(id: string, dto: UpdateContactDto): Promise<UpdateResult> {
    let user: User | undefined;

    if (dto.assignedTo)
      user = await this.findUserOrFail(dto.assignedTo);

    return await this.contactRepo.update(id, { ...dto, assignedTo: user });
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

  private findUserOrFail(id: string | undefined): Promise<User> {
    return this.userRepo.findOneByOrFail({ id });
  }
}

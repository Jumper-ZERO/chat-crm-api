import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
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

  async findAll(): Promise<Contact[]> {
    return this.contactRepo.find({
      withDeleted: true,
      relations: ['assignedTo'],
    });
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

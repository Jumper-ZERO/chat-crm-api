import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repo.create({
      ...createUserDto,
      company: { id: createUserDto.companyId } as Company
    })
    return this.repo.save(user);
  }

  searchUser(dto: UserSearchDto) {
    const { q, limit } = dto;
    const findOptions: FindManyOptions<User> = {
      where: [
        { username: Like(`%${q}%`) },
        { firstName: Like(`%${q}%`) },
        { lastName: Like(`%${q}%`) },
      ],
      take: limit,
      order: { username: 'ASC' }
    };

    return this.repo.find(findOptions);
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username },
      relations: ['company']
    });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.repo.update(id, updateUserDto)
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

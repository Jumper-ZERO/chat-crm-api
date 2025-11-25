import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { User } from 'src/modules/users/entities/user.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserTableQueryDto } from '../../common/schemas/user-table-query.schema';
import { buildQueryOptions } from '../../lib/helpers/build-query-options.helper';
import { Chat } from '../chats/entities';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
  ) { }

  async online(id: string) {
    const result = await this.repo.update({ id }, { status: 'online' })
    return result.affected === 1;
  }

  async offline(id: string) {
    const result = await this.repo.update({ id }, { status: 'offline' })
    return result.affected === 1;
  }

  async table(query: UserTableQueryDto): Promise<Pagination<User>> {
    const { findOptions, paginationOptions } = buildQueryOptions<User>(query);

    const defaultFindOptions: FindManyOptions<User> = {
      where: { isDeleted: false },
      order: { status: 'DESC', updatedAt: 'DESC' },
    };

    const mergedFindOptions: FindManyOptions<User> = {
      ...defaultFindOptions,
      ...findOptions,
      where: { ...defaultFindOptions.where, ...findOptions.where },
      order: { ...defaultFindOptions.order, ...findOptions.order },
    };

    return paginate<User>(
      this.repo,
      paginationOptions,
      mergedFindOptions,
    );
  }

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
      where: q ? [
        { username: Like(`%${q}%`) },
        { firstNames: Like(`%${q}%`) },
        { lastNames: Like(`%${q}%`) },
      ] : {},
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

  async findOrCreateSystemUser(companyId: string): Promise<User> {
    const existing = await this.repo.findOne({ where: { role: 'system', company: { id: companyId } } });

    if (existing) return existing;

    const created = this.repo.create({
      role: 'system',
      username: 'System',
      password: "password", // Will be hashed before insert
      status: 'online',
      company: { id: companyId },
    });

    return this.repo.save(created);
  }

  async findAvailableAgent(companyId: string): Promise<User> {
    const agents = await this.repo.find({
      where: {
        company: { id: companyId },
        role: 'agent',
        status: 'online',
      },
      relations: ['company'],
    });

    if (agents.length === 0) {
      return this.findOrCreateSystemUser(companyId);
    }

    const agentsWithLoad = await Promise.all(
      agents.map(async (agent) => {
        const activeChats = await this.chatRepo.count({
          where: { assignedAgent: { id: agent.id }, status: 'open' },
        });
        return { agent, activeChats };
      }),
    );

    agentsWithLoad.sort((a, b) => a.activeChats - b.activeChats);
    const bestAgent = agentsWithLoad[0].agent;

    return bestAgent;
  }

  async getAgent() {
    const agent = await this.repo.findOne({ where: { status: 'online' } });
    if (agent) return agent;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username },
      relations: ['company']
    });
  }

  update(id: string, dto: UpdateUserDto): Promise<UpdateResult> {
    return this.repo.update(id, { ...dto, company: { id: dto.companyId } })
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

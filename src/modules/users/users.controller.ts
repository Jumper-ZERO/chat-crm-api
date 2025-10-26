import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type UserSearchDto, userSearchSchema } from './dto/user-search.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { userTableQuerySchema, type UserTableQueryDto } from '../../common/schemas/user-table-query.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('table')
  @UsePipes(new ZodValidationPipe(userTableQuerySchema))
  getTable(@Body() query: UserTableQueryDto) {
    return this.usersService.table(query);
  }

  @Get("search")
  @UsePipes(new ZodValidationPipe(userSearchSchema))
  search(@Query() query: UserSearchDto) {
    return this.usersService.searchUser(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

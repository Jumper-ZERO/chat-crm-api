import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';

import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';
import { User } from '../modules/users/entities/user.entity';
import { WhatsAppConfigService } from '../modules/whatsapp/services/whatsapp-config.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private whatsappConfigService: WhatsAppConfigService
  ) { }

  async valid(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    const isValid = user && bcrypt.compareSync(pass, user.password);
    if (user && isValid) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async sign(dto: LoginDto) {
    const user: User = await this.valid(dto.username, dto.password);
    console.log(user);
    const config = await this.whatsappConfigService.getActiveByCompany(user.company.id);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      avatar: user?.avatar,
      email: user?.email,
      companyId: user.company?.id || '',
      businessId: config?.businessId || '',
    };

    const access_token = await this.jwtService.signAsync(payload);

    return { payload, access_token };
  }

  refresh() {
    // TODO: implement refresh token logic
    return { message: 'Not implemented' }
  }
}

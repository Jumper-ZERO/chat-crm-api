import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from 'src/modules/users/users.service';

import { JwtPayload } from './auth.types';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async signIn(
    username: string,
    pass: string,
    res: Response
  ): Promise<{ access_token: string }> {
    const user: User | null = await this.usersService.findByUsername(username)

    const isValid = user && bcrypt.compareSync(pass, user.password)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role }
    const access_token = await this.jwtService.signAsync(payload)

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax', // 'none' in https
      secure: process.env.COOKIE_SECURE === '1',
      maxAge: 24 * 60 * 60 * 1000,
    })

    return { access_token }
  }

  logout(res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout success' }
  }
}

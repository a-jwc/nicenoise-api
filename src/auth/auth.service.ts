import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

const saltRounds = 10;

enum PostgresErrorCode {
  UniqueViolation = 'P2002',
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.user({
        username,
      });
      await this.verifyPassword(password, user.password);
      if (user) {
        const { password, ...result } = user;
        return result;
      }
    } catch (err) {
      throw new HttpException('Bad credentials', HttpStatus.BAD_REQUEST);
    }
    return null;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching)
      throw new HttpException('Bad credentials', HttpStatus.BAD_REQUEST);
  }

  async register(data: Prisma.UserCreateInput) {
    const hashedPass = await bcrypt.hash(data.password, saltRounds);
    try {
      const user = await this.usersService.createUser({
        email: data.email,
        username: data.username,
        password: hashedPass,
      });
      const { password, ...result } = user;
      if (user) return result;
    } catch (err) {
      if (err.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with the username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getCookieWithJwtToken(user: Prisma.UserUncheckedUpdateInput) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
  }

  getJwtToken(user: Prisma.UserUncheckedUpdateInput) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return token;
  }
}

import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() response: Response) {
    const token = this.authService.getJwtToken(req.user);
    response.cookie('token', token, {
      expires: new Date(new Date().getTime() + 30 * 1000),
      httpOnly: true,
    });
    return response.send(req.user);
  }

  @Post('register')
  async register(
    @Body() registrationData: Prisma.UserCreateInput,
    @Res() response: Response,
  ) {
    const user = await this.authService.register(registrationData);
    const token = this.authService.getJwtToken(user);
    response.cookie('token', token, {
      expires: new Date(new Date().getTime() + 30 * 1000),
      httpOnly: true,
    });
    return response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

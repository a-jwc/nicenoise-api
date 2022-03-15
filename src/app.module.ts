import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { UserController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { SoundsModule } from './sounds/sounds.module';
import { SoundsController } from './sounds/sounds.controller';
import { SoundsService } from './sounds/sounds.service';

@Module({
  imports: [AuthModule, UsersModule, SoundsModule],
  controllers: [
    AppController,
    AuthController,
    UserController,
    SoundsController,
  ],
  providers: [AppService, UsersService, PrismaService, SoundsService],
})
export class AppModule {}

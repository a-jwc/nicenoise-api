import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LikesService } from './likes.service';

@Module({
  providers: [LikesService, PrismaService],
  exports: [LikesService],
})
export class LikesModule {}

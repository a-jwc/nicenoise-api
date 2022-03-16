import { Injectable } from '@nestjs/common';
import { Likes, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.LikesCreateInput): Promise<Likes> | null {
    const userId: number = +data.likedBy.connect.id;
    const soundId: number = +data.Sound.connect.id;
    try {
      const like = await this.prismaService.likes.findFirst({
        where: { userId, soundId },
      });
      // console.log(like);
      if (like === null) {
        return await this.prismaService.likes.create({ data });
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async aggCount(id: number): Promise<number> {
    try {
      return await this.prismaService.likes.count({
        where: { soundId: id },
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

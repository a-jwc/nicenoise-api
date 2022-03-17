import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  StreamableFile,
} from '@nestjs/common';
import { Prisma, Sound } from '@prisma/client';
import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { PrismaService } from 'src/prisma.service';
import { join } from 'path';

@Injectable()
export class SoundsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.SoundCreateInput): Promise<Sound> {
    return this.prismaService.sound.create({ data });
  }

  async readById(id: Prisma.SoundWhereUniqueInput): Promise<Sound> {
    // convert to Int
    const idNum = +id;
    return this.prismaService.sound.findUnique({ where: { id: idNum } });
  }

  async readOrderedMany(order: Prisma.SortOrder): Promise<Sound[]> {
    return this.prismaService.sound.findMany({
      take: 10,
      orderBy: [{ uploadDate: order }],
    });
  }

  async readFilteredMany(
    id: Prisma.SoundWhereUniqueInput,
    order: Prisma.SortOrder,
  ) {
    const idNum = +id;
    return this.prismaService.user.findMany({
      where: { id: idNum },
      include: { sounds: { orderBy: [{ uploadDate: order }] } },
    });
  }

  // async readFilteredByLikes() {
  //   return this.prismaService.user.findMany
  // }

  async stream(
    id: Prisma.SoundWhereUniqueInput,
    response: Response,
    request: Request,
  ) {
    try {
      const idNum = +id;
      const data = await this.prismaService.sound.findUnique({
        where: { id: idNum },
      });
      if (!data) throw new NotFoundException(null, 'Could not find sound');
      const { range } = request.headers;
      if (range) {
        const { sound } = data;
        const soundPath = join(
          process.cwd(),
          `./public/uploadedSounds/${sound}`,
        );
        const soundStat = statSync(soundPath);
        const CHUNK_SIZE = 1 * 1e6;
        const start = Number(range.replace(/\D/g, ''));
        const contentType = 'audio/mpeg';
        // if (start === 0) contentType = 'multipart/byteranges';
        const end = Math.min(start + CHUNK_SIZE, soundStat.size - 1);
        // const soundLength = end - start + 1;
        // response.status(206);
        response.header({
          // 'Content-Range': `bytes ${start}-${end}/${soundStat.size}`,
          // 'Content-Range': `bytes ${start}-${soundStat.size - 1}/${
          //   soundStat.size
          // }`,
          // 'Accept-Ranges': 'bytes',
          'Content-length': soundStat.size,
          'Content-Type': contentType,
        });
        const stream = createReadStream(soundPath);
        stream.pipe(response);
      } else {
        throw new NotFoundException(null, 'range not found');
      }
    } catch (err) {
      throw new ServiceUnavailableException();
    }
  }

  async delete(where: Prisma.SoundWhereUniqueInput) {
    this.prismaService.sound.delete({ where });
  }

  async updateSound(params: {
    where: Prisma.SoundWhereUniqueInput;
    data: Prisma.SoundUpdateInput;
  }): Promise<Sound> {
    const { where, data } = params;
    return this.prismaService.sound.update({
      data,
      where,
    });
  }
}

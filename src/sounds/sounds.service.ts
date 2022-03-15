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
        const soundPath = join(process.cwd(), `./public/${sound}`);
        const soundStat = statSync(soundPath);
        const CHUNK_SIZE = 1 * 1e6;
        const start = Number(range.replace(/\D/g, ''));
        let contentType = 'audio/mpeg';
        // if (start === 0) contentType = 'multipart/byteranges';
        const end = Math.min(start + CHUNK_SIZE, soundStat.size - 1);
        const soundLength = end - start + 1;
        response.status(206);
        response.header({
          'Content-Range': `bytes ${start}-${end}/${soundStat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-length': soundLength,
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
    console.log(where);
    this.prismaService.sound.delete({ where });
  }
}

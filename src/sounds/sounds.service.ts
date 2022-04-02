import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, Sound } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { download, upload } from 'src/aws/s3';
import { s3Client } from 'src/aws/s3Client';

@Injectable()
export class SoundsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: Prisma.SoundCreateInput,
    file: Express.Multer.File,
  ): Promise<Sound> {
    const bucketParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'sounds/' + data.sound,
      Body: file.buffer,
    };
    const uploadRes = await upload(s3Client, bucketParams);
    console.log(uploadRes);
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

  // help for time seeking from: https://gist.github.com/padenot/1324734
  async streamFromS3(
    id: Prisma.SoundWhereUniqueInput,
    response: Response,
    request: Request,
  ) {
    try {
      const idNum = +id;
      const sound = await this.prismaService.sound.findUnique({
        where: { id: idNum },
      });
      const bucketParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'sounds/' + sound.sound,
      };
      const data = await download(s3Client, bucketParams);
      // stream.pipe(response);
      return data;
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

  async aggCount(id: number): Promise<number> {
    try {
      const sound = await this.prismaService.sound.findUnique({
        where: { id },
        select: { likes: true },
      });
      return sound.likes.length;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

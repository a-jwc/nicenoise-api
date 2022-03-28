import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import { exclude } from 'src/helpers/helpers';
import { s3Client } from 'src/aws/s3Client';
import { deleteObject, download, upload } from 'src/aws/s3';
import internal from 'stream';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        likes: true,
        sounds: true,
      },
    });
  }

  async getUserLikesSoundObject(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<any> {
    const userLikes: Prisma.UserInclude = {
      likes: {},
      sounds: true,
    };
    const temp = this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: userLikes,
    });

    console.log(temp);
    return temp;
  }

  async getUserLikesAuthorInfo(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ) {
    const userLikes: Prisma.UserSelect = {
      likes: true,
    };
    return userLikes.sounds;
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        ...exclude('user', ['password']),
        likes: {
          include: {
            sound: {
              select: {
                ...exclude('user', ['password']),
              },
            },
          },
        },
      },
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async updateUserAvatar(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    file: Express.Multer.File,
  ) {
    const { where, data } = params;
    const bucketUploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'images/' + data.avatar,
      Body: file.buffer,
    };
    const oldAvatar = await this.prisma.user.findUnique({
      where,
      select: { avatar: true },
    });
    const bucketDeleteParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'images/' + oldAvatar.avatar,
    };
    const uploadRes = await upload(s3Client, bucketUploadParams);
    const deletedRes = await deleteObject(s3Client, bucketDeleteParams);
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async getUserAvatar(avatar: string, response: Response) {
    const bucketParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'images/' + avatar,
    };
    const data = await download(s3Client, bucketParams);
    const stream = data.Body as internal.Readable;
    const contentLength = data.ContentLength;
    response.header({
      'Content-Type': 'image/jpeg',
      'Content-Length': contentLength,
    });
    stream.pipe(response);
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}

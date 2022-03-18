import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import { exclude } from 'src/helpers/helpers';

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

  async updateUserMany(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}

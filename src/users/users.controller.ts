import {
  Controller,
  Get,
  UseGuards,
  Res,
  Req,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  Body,
  Put,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { SoundsService } from 'src/sounds/sounds.service';
import { hashPassword } from 'src/helpers/auth';
import { createFileName } from 'src/utils/fileUtils';

@Controller('api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly soundsService: SoundsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('likes')
  async getLikes(@Req() req) {
    const result = await this.userService.getUserLikesSoundObject({
      id: req.user.id,
    });
    return result.likes;
  }

  @Get('get-avatar/:username')
  async getAvatar(
    @Param('username') username,
    @Req() req,
    @Res() res: Response,
  ) {
    const { avatar } = await this.userService.user({
      username,
    });
    if (avatar === null) return res.sendStatus(HttpStatus.NOT_FOUND);
    return await this.userService.getUserAvatar(avatar, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-logged-in')
  isLoggedIn(@Req() req, @Res() res) {
    return res.send({ status: true, username: req.user.username });
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const filename = createFileName(file);
    const avatar = await this.userService.updateUserAvatar(
      {
        where: { id: req.user.id },
        data: { avatar: filename },
      },
      file,
    );
    return avatar;
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-avatar')
  async deleteAvatar(@Req() req) {
    return await this.userService.deleteUserAvatar({
      where: { id: req.user.id },
      data: { avatar: null },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-user')
  async updateUserInfo(
    @Req() req,
    @Res() res: Response,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    if (data.username) {
      const updateUserSounds: Prisma.SoundUpdateManyWithoutAuthorInput = {
        updateMany: { where: {}, data: { authorName: data.username } },
      };
      await this.userService.updateUser({
        where: { id: req.user.id },
        data: { sounds: updateUserSounds, username: data.username },
      });
    }
    if (data.email) {
      await this.userService.updateUser({
        where: { id: req.user.id },
        data: { email: data.email },
      });
    }
    if (data.password) {
      const hashedPassword = await hashPassword(data.password as string);
      await this.userService.updateUser({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });
    }

    return res
      .status(HttpStatus.OK)
      .send({ message: 'User account information updated.' });
  }

  @Get(':username')
  async getProfile(@Param('username') username, @Req() req) {
    const { password, ...user } = await this.userService.userWithLikesAndSounds(
      {
        username,
      },
    );
    return user;
  }
}

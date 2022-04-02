import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma, Sound } from '@prisma/client';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SoundsService } from './sounds.service';
import { UsersService } from 'src/users/users.service';
import { createFileName } from 'src/utils/fileUtils';
import internal from 'node:stream';

@Controller('api/v1/sounds')
export class SoundsController {
  constructor(
    private readonly soundService: SoundsService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getOrderedMany(@Query('order') order: Prisma.SortOrder) {
    return await this.soundService.readOrderedMany(order);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Res() response: Response,
    @Req() request,
    @Body() sound: Sound,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filename = createFileName(file);
    const requestBody: Prisma.SoundCreateInput = {
      author: { connect: { id: request.user.id } },
      authorName: request.user.username,
      title: file.originalname,
      sound: filename,
      uploadDate: new Date(Date.now()).toISOString(),
    };
    const newSound = await this.soundService.create(requestBody, file);
    return response.status(HttpStatus.CREATED).json({ newSound });
  }

  @Get('count-likes/:id')
  async countLikes(@Param('id') id) {
    const soundId = +id;
    return await this.soundService.aggCount(soundId);
  }

  @Get('info/:id')
  async get(@Param('id') id) {
    return await this.soundService.readById(id);
  }

  @Get('/:id')
  async stream(
    @Param('id') id,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const data = await this.soundService.streamFromS3(id, response, request);
    const stream = data.Body as internal.Readable;
    const contentLength = data.ContentLength;
    response.set({
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'audio/webm',
    });
    stream.pipe(response);
  }

  // @Post('delete/:id')
  // async delete(@Param('id') id) {
  //   return await this.soundService.delete(id);
  // }

  @Get('user/:id')
  async getSoundsFromUser(
    @Param('id') id,
    @Query('order') order: Prisma.SortOrder,
  ) {
    const data = await this.soundService.readFilteredMany(id, order);
    if (data.length === 0) return [];
    const { sounds } = data[0];
    return sounds;
  }

  @UseGuards(JwtAuthGuard)
  @Post('like/:id')
  async like(@Param('id') id, @Req() req, @Res() res: Response) {
    const sound = await this.soundService.readById(id);
    const likes = await this.userService.updateUser({
      where: { id: req.user.id },
      data: { likes: { connect: { id: sound.id } } },
    });
    if (likes === null) {
      res.status(HttpStatus.FORBIDDEN).send({ message: 'Already liked' });
      return;
    }
    const soundId: number = +id;
    const likesCount = await this.soundService.aggCount(soundId);
    await this.soundService.updateSound({
      where: { id: sound.id },
      data: { likesCount },
    });
    res.status(HttpStatus.OK).send({ likesCount });
  }
}

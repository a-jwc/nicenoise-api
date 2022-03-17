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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Prisma, Sound } from '@prisma/client';
import { Response, Request } from 'express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SoundsService } from './sounds.service';
import { v4 as uuidv4 } from 'uuid';
import { LikesService } from 'src/likes/likes.service';
import { UsersService } from 'src/users/users.service';

@Controller('api/v1/sounds')
export class SoundsController {
  constructor(
    private readonly soundService: SoundsService,
    private readonly likesService: LikesService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getOrderedMany(@Query('order') order: Prisma.SortOrder) {
    return await this.soundService.readOrderedMany(order);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     {
  //       name: 'sound',
  //       maxCount: 1,
  //     },
  //     { name: 'cover', maxCount: 1 },
  //   ]),
  // )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploadedSounds',
        filename: (_req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
        },
      }),
    }),
  )
  async upload(
    @Res() response: Response,
    @Req() request,
    @Body() sound: Sound,
    // @UploadedFiles()
    // files: { sound?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const requestBody: Prisma.SoundCreateInput = {
      author: { connect: { id: request.user.id } },
      authorName: request.user.username,
      title: file.originalname,
      sound: file.filename,
      uploadDate: new Date(Date.now()).toISOString(),
    };
    const newSound = await this.soundService.create(requestBody);
    return response.status(HttpStatus.CREATED).json({ newSound });
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
    return await this.soundService.stream(id, response, request);
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
    const likedByUser = await this.userService.user({ id: req.user.id });
    const author = await this.userService.user({ id: sound.authorId });
    const data: Prisma.LikesCreateInput = {
      sound: { connect: { id: sound.id } },
      likedBy: { connect: { id: likedByUser.id } },
      author: { connect: { id: author.id } },
    };
    const likes = await this.likesService.create(data);
    if (likes === null) {
      res.status(HttpStatus.FORBIDDEN).send({ message: 'Already liked' });
      return;
    }
    const soundId: number = +id;
    const likesCount = await this.likesService.aggCount(soundId);
    const update = await this.soundService.updateSound({
      where: { id: sound.id },
      data: { likesCount },
    });
    res.status(HttpStatus.OK).send({ likesCount });
  }
}

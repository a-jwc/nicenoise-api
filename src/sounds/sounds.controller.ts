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
import { UsersService } from 'src/users/users.service';
import { SoundsService } from './sounds.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/v1/sounds')
export class SoundsController {
  constructor(
    private readonly soundService: SoundsService,
    private readonly userService: UsersService,
  ) {}

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
    console.log(id);
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

  @Get()
  async getOrderedMany(@Query('order') order: Prisma.SortOrder) {
    return await this.soundService.readOrderedMany(order);
  }

  @Get('user/:id')
  async getSoundsFromUser(
    @Param('id') id,
    @Query('order') order: Prisma.SortOrder,
  ) {
    const data = await this.soundService.readFilteredMany(id, order);
    const { posts } = data[0];
    return posts;
  }
}

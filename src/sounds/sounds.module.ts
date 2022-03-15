import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SoundsController } from './sounds.controller';
import { v4 as uuidv4 } from 'uuid';
import { SoundsService } from './sounds.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [SoundsController],
  providers: [SoundsService, PrismaService],
})
export class SoundsModule {}

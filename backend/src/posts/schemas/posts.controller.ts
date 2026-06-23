import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { PostsService } from './../posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { QueryPostsDto } from '../dto/query-posts.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

// Mismo patrón que en auth.controller.ts: storage de Multer apuntando a Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'red-social-tp-posts',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    };
  },
});

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: any,
    @CurrentUser() user: JwtPayload,
  ) {
    const imagenUrl = file ? file.path : undefined;
    return this.postsService.create(createPostDto, user.uuid, imagenUrl);
  }

  @Get()
  findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.remove(id, user.uuid, user.rol);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.addLike(id, user.uuid);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.removeLike(id, user.uuid);
  }
}
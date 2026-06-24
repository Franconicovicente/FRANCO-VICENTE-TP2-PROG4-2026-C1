import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from '../posts.service';
import { Post, PostSchema } from './post.schema';
import { AuthModule } from '../../auth/auth.module'; // para tener acceso a JwtAuthGuard (PassportModule/JwtModule)

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
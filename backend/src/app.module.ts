import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/schemas/posts.module';
import { CommentsModule } from './comments/comments.module';
@Module({
  imports: [
  ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
  MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const uri = configService.get<string>('MONGO_URI');
    console.log('🔌 Intentando conectar a:', uri);
    return {
      uri,
      family: 4, 
      connectTimeoutMS: 10000, 
    };
  },
  inject: [ConfigService],
}),
  AuthModule,
  PostsModule,
  CommentsModule
],
})
export class AppModule {}
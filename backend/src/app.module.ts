import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    envFilePath: '.env', // 👈 Le especificamos el archivo exacto
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
],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://gestion_user:Franconi08%21@cluster0-shard-00-00.lyfoszr.mongodb.net:27017,cluster0-shard-00-01.lyfoszr.mongodb.net:27017,cluster0-shard-00-02.lyfoszr.mongodb.net:27017/tp_red_social?ssl=true&replicaSet=atlas-lyfoszr-shard-0&authSource=admin&retryWrites=true&w=majority'),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
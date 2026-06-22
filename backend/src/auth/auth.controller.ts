import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// 1. cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. almacenamiento de multer para que apunte acloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'red-social-tp', // Nombre de la carpeta que se creará en tu Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    };
  },
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('foto', { storage })) // storage de Cloudinary
  register(@Body() registerDto: RegisterDto, @UploadedFile() file: any) {
    // Cloudinary nos devuelve la URL en 'file.path' o 'file.secure_url'
    const fotoUrl = file ? file.path : undefined;
    
    return this.authService.register(registerDto, fotoUrl);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('autorizar')
  @UseGuards (JwtAuthGuard)
  autorizar(@CurrentUser () user: JwtPayload ) {
    // Si llegamos hasta acá, el JwtAuthGuard ya validó la firma y la expiración del token.
    // Si el token fuera inválido o estuviera vencido, el guard ya habría devuelto 401 antes de entrar aquí.
    return this.authService.autorizar(user.uuid);
  }
 
  @Post('refrescar')
  @UseGuards(JwtAuthGuard)
  refrescar(@CurrentUser() user: JwtPayload) {
    return this.authService.refrescar(user);
  }
}
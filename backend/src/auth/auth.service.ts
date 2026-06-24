import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  // 1. REGISTRO (POST)
  async register(registerDto: RegisterDto, fotoUrl?: string): Promise<User> {
    const { correo, username, password } = registerDto;

    //  correo ya existe
    const emailExiste = await this.userModel.findOne({ correo });
    if (emailExiste) {
      throw new BadRequestException('El correo ya se encuentra registrado');
    }

    //  username ya existe
    const usernameExiste = await this.userModel.findOne({ username });
    if (usernameExiste) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    // Encriptar contraseña 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Armar objeto con datos que se van a guardar
    const datosUsuario = {
      ...registerDto,
      password: hashedPassword,
    };

    // Si el controlador nos pasó una URL de Cloudinary, la sumo al objeto
    // Si no viene, Mongoose usará la foto por defecto de schema
    if (fotoUrl) {
      datosUsuario['fotoUrl'] = fotoUrl;
    }

    const nuevoUsuario = new this.userModel(datosUsuario);
    return await nuevoUsuario.save();
  }

  // 2. LOGIN (POST)
  async login(loginDto: LoginDto): Promise<any> {
    const { loginField, password } = loginDto;

    // Buscar por correo / username
    const usuario = await this.userModel.findOne({
      $or: [
        { correo: loginField.toLowerCase() },
        { username: loginField.toLowerCase() }
      ]
    });

    // Si no existe el usuario
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    // Devolver todos los datos del usuario 
    // Ocultamos la contraseña 
    // conversion documento de Mongoose a un objeto JS común
    const usuarioJson = usuario.toObject();
    
    // separar password y guardar todo el resto en 'usuarioSinPassword'
    const { password: _, ...usuarioSinPassword } = usuarioJson;

    // 🔑 CREAMOS EL JWT SEGÚN LAS PAUTAS OBLIGATORIAS
    const token = jwt.sign(
      { 
        uuid: usuario._id,               // uuid exigido
        correo: usuario.correo,           // correo exigido
        username: usuario.username,       // nombre de usuario exigido
        rol: usuario.rol                  // rol exigido
      },
      process.env.JWT_SECRET || 'nobu_secret_key_2026_progra_iv',
      { expiresIn: '15m' } // ⏱️ Vencimiento : 15 minutos
    );

    // Validar contraseña sin encriptar contra la encriptada de la BD
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }


    return {
      user: usuarioSinPassword,
      token: token
    }
  }
}
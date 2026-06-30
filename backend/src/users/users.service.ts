import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/schemas/user.schema';
import { CreateUserDto } from './dto/create.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(): Promise<any[]> {
    const usuarios = await this.userModel.find().select('-password');
    return usuarios;
  }

  async create(dto: CreateUserDto): Promise<any> {
    const emailExiste = await this.userModel.findOne({ correo: dto.correo.toLowerCase() });
    if (emailExiste) {
      throw new BadRequestException('El correo ya se encuentra registrado');
    }

    const usernameExiste = await this.userModel.findOne({ username: dto.username.toLowerCase() });
    if (usernameExiste) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const nuevoUsuario = new this.userModel({
      ...dto,
      password: hashedPassword,
    });

    const guardado = await nuevoUsuario.save();
    const usuarioJson = guardado.toObject();
    const { password: _, ...usuarioSinPassword } = usuarioJson;
    return usuarioSinPassword;
  }

  // Baja lógica: el usuario queda deshabilitado, no puede iniciar sesión
  async disable(userId: string): Promise<void> {
    const usuario = await this.userModel.findById(userId);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    usuario.eliminado = true;
    await usuario.save();
  }

  // Alta lógica: rehabilita a un usuario previamente deshabilitado
  async enable(userId: string): Promise<void> {
    const usuario = await this.userModel.findById(userId);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    usuario.eliminado = false;
    await usuario.save();
  }
}
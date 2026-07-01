
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  apellido!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string; // Nombre de usuario (único en DB)

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: string;

  @Prop({ required: false, default: '' })
  descripcion!: string;

  @Prop({ default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' })
  fotoUrl!: string; // Guardaremos la URL de la imagen aquí

  @Prop({ required: true, default: 'usuario', enum: ['usuario', 'administrador'] })
  rol!: string; // Atributo perfil por defecto "usuario"

  // Soft delete: usuario deshabilitado no puede iniciar sesión, pero sus datos se conservan
  @Prop({ default: false })
  eliminado!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
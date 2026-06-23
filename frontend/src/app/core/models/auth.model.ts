import { User } from './user.model';

export interface RegisterDto {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password: string;
  fechaNacimiento: string; // formato YYYY-MM-DD (lo que devuelve un <input type="date">)
  descripcion?: string;
}

export interface LoginDto {
  loginField: string; // Acepta correo o nombre de usuario
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
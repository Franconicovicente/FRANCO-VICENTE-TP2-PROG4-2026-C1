export class CreateUserDto {
  nombre!: string;
  apellido!: string;
  correo!: string;
  username!: string;
  password!: string;
  fechaNacimiento!: string;
  descripcion?: string;
  rol!: 'usuario' | 'administrador';
}
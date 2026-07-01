export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoUrl: string;
  rol: 'usuario' | 'administrador';
  eliminado : boolean;
}
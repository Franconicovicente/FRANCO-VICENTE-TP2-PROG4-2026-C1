import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const MOCK_USER: User = {
  _id: 'u1',
  nombre: 'Alex',
  apellido: 'Rivera',
  correo: 'alex.rivera@example.com',
  username: 'alex_rivera',
  fechaNacimiento: '1995-04-12',
  descripcion: 'Diseñador y entusiasta de la tecnología. Explorando la intersección entre la estética minimalista y la funcionalidad digital.',
  fotoUrl: '',
  rol: 'usuario',
  eliminado: false,
};

@Injectable({ providedIn: 'root' })
export class UserService {
  // Mock local con signal; más adelante esto se reemplaza por una llamada HTTP real a /users/me
  private profile = signal<User>(MOCK_USER);

  getProfile() {
    return this.profile.asReadonly();
  }
}
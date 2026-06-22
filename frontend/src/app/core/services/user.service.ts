import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const MOCK_USER: User = {
  id: 'u1',
  username: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  bio: 'Diseñador y entusiasta de la tecnología. Explorando la intersección entre la estética minimalista y la funcionalidad digital.',
  avatarUrl: '',
  followersCount: 1200,
  followingCount: 850,
  postsCount: 124,
};

@Injectable({ providedIn: 'root' })
export class UserService {
  // Mock local con signal; más adelante esto se reemplaza por una llamada HTTP real a /users/me
  private profile = signal<User>(MOCK_USER);

  getProfile() {
    return this.profile.asReadonly();
  }
}
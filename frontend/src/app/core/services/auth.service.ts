import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://franco-vicente-tp2-prog4-2026-c1.onrender.com/auth'; // Ajustar puerto/ruta según tu back

  // Señal con el usuario actual (null = no logueado)
  currentUser = signal<User | null>(this.getStoredUser());

  // El registro va como multipart/form-data porque el back acepta una foto opcional (Cloudinary)
  register(data: RegisterDto, foto?: File): Observable<User> {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('apellido', data.apellido);
    formData.append('correo', data.correo);
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('fechaNacimiento', data.fechaNacimiento);
    if (data.descripcion) {
      formData.append('descripcion', data.descripcion);
    }
    if (foto) {
      formData.append('foto', foto);
    }

    // El back de /register devuelve el User creado directamente, NO un AuthResponse con token.
    // Esto significa que después de registrarse, el usuario tiene que hacer login para obtener su JWT.
    return this.http.post<User>(`${this.apiUrl}/register`, formData);
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

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

  // Valida el token actual contra el back. Si es válido, devuelve los datos completos
  // del usuario (y los actualiza en localStorage/signal). Si no, el back responde 401
  // y quien llame a este método se entera por el error del Observable.
  autorizar(): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/autorizar`, {}).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  // Pide un token nuevo con la misma payload (mismo usuario), reiniciando el vencimiento a 15 min.
  refrescar(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/refrescar`, {}).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('loginTimestamp', Date.now().toString());
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTimestamp');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Momento (timestamp en ms) en que se inició la sesión actual, usado por el contador de sesión
  getLoginTimestamp(): number | null {
    const raw = localStorage.getItem('loginTimestamp');
    return raw ? Number(raw) : null;
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('loginTimestamp', Date.now().toString());
    this.currentUser.set(res.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
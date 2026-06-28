import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { ThemeToggleComponent } from '../../shared/components/modal/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  modalService = inject(ModalService);
  private router = inject(Router);

  showPassword = signal(false);
  loading = signal(false);
  rememberMe = signal(false);

  loginForm = this.fb.group({
    loginField: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get loginField() { return this.loginForm.get('loginField'); }
  get password() { return this.loginForm.get('password'); }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleRememberMe(): void {
    this.rememberMe.update((value) => !value);
  }

  onForgotPassword(): void {
    this.modalService.showInfo(
      'Recuperar contraseña',
      'Esta función todavía no está disponible. Por ahora, contactate con soporte si necesitás recuperar el acceso a tu cuenta.'
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { loginField, password } = this.loginForm.value;

    this.authService.login({ loginField: loginField!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        // Navega a la raíz, que carga el Splash: ahí se valida el token recién obtenido
        // contra /auth/autorizar y, si todo está bien, te manda a /feed automáticamente.
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const mensaje = err?.error?.message || 'Correo/usuario o contraseña incorrectos. Verificá tus datos e intentá nuevamente.';
        this.modalService.showError('No pudimos iniciar tu sesión', mensaje);
      }
    });
  }
}
import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { ThemeToggleComponent } from '../../shared/components/modal/theme-toggle/theme-toggle';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  showPassword = false;
  showConfirmPassword = false;
  loading = false;

  registerForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator }
  );

  // Validador custom: contraseña y confirmación deben coincidir
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Getters para acceder fácil a los controles desde el HTML
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => {
        this.loading = false;
        this.modalService.showSuccess(
          '¡Cuenta creada!',
          `Tu cuenta se registró correctamente. Ya podés empezar a publicar y conectar con la comunidad.`
        );
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        const mensaje = err?.error?.message || 'No pudimos crear tu cuenta. Verificá los datos e intentá nuevamente.';
        this.modalService.showError('Error al registrarte', mensaje);
      }
    });
  }

  loginWithProvider(provider: 'google' | 'facebook'): void {
    this.modalService.showInfo(
      'Función no disponible',
      `El inicio de sesión con ${provider === 'google' ? 'Google' : 'Facebook'} todavía no está habilitado en esta versión. Registrate con tu email por ahora.`
    );
  }
}
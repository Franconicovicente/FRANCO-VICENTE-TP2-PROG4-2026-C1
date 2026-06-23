import { Component, inject, signal } from '@angular/core';
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

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  loading = signal(false);

  // Foto de perfil seleccionada (opcional) + su preview para mostrar en pantalla
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  registerForm = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator }
  );

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
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get username() { return this.registerForm.get('username'); }
  get correo() { return this.registerForm.get('correo'); }
  get fechaNacimiento() { return this.registerForm.get('fechaNacimiento'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.modalService.showError(
        'Formato no permitido',
        'La foto de perfil debe ser JPG, PNG o WEBP.'
      );
      return;
    }

    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { nombre, apellido, username, correo, fechaNacimiento, descripcion, password } = this.registerForm.value;

    this.authService.register(
      {
        nombre: nombre!,
        apellido: apellido!,
        username: username!,
        correo: correo!,
        fechaNacimiento: fechaNacimiento!,
        descripcion: descripcion || undefined,
        password: password!,
      },
      this.selectedFile() ?? undefined
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.modalService.showSuccess(
          '¡Cuenta creada!',
          'Tu cuenta se registró correctamente. Ahora podés iniciar sesión con tu correo o nombre de usuario.'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
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
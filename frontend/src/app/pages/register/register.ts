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
  fotoArchivo: File | null = null; // 📸 Guardará el archivo de imagen real

  // Expresión regular: Mínimo 8 caracteres, al menos una mayúscula y un número
  private passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  registerForm = this.fb.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      foto: [null, [Validators.required]] // Campo obligatorio para la foto de perfil
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

  // 📸 Captura la imagen cuando el usuario la selecciona en el HTML
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.fotoArchivo = event.target.files[0];
      this.registerForm.patchValue({ foto: event.target.files[0] });
    }
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  // Getters para usar fácil en el HTML
  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get correo() { return this.registerForm.get('correo'); }
  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get fechaNacimiento() { return this.registerForm.get('fechaNacimiento'); }
  get descripcion() { return this.registerForm.get('descripcion'); }
  get foto() { return this.registerForm.get('foto'); }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // 📁 Empaquetamos todo en un FormData porque incluye archivo binario
    const formData = new FormData();
    const formValues = this.registerForm.value;

    Object.keys(formValues).forEach(key => {
      const valor = formValues[key as keyof typeof formValues];
      if (key !== 'foto' && key !== 'confirmPassword' && valor !== null && valor !== undefined) {
        formData.append(key, valor.toString());
      }
    });

    if (this.fotoArchivo) {
      formData.append('foto', this.fotoArchivo);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.loading = false;
        this.modalService.showSuccess(
          '¡Cuenta creada!',
          `Tu cuenta se registró correctamente. Ya podés iniciar sesión.`
        );
        this.router.navigate(['/login']);
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
      `El inicio de sesión con ${provider === 'google' ? 'Google' : 'Facebook'} todavía no está habilitado.`
    );
  }
}
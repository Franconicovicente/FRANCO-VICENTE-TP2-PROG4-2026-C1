import { Component, inject, signal, OnInit, viewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

// Importamos lo que armamos en el Paso 1
import { StatusTextPipe } from '../../../shared/pipes/status-text-pipe';
import { RoleNamePipe } from '../../../shared/pipes/role-name-pipe';
import { StatusColorDirective } from '../../../shared/directives/status-color';
import { DebounceClickDirective } from '../../../shared/directives/debounce-click';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule, 
    StatusTextPipe, 
    RoleNamePipe, 
    StatusColorDirective,  
    DebounceClickDirective,
    DatePipe
  ],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`; 

  // Signals para manejar el estado
  usuarios = signal<User[]>([]);
  
  // Guardamos los datos del nuevo usuario en una Signal de objeto para el Form
  nuevoUsuario = signal({
    nombre: '',
    apellido: '',
    descripcion: '',
    correo: '',
    username: '',
    password: '',
    fechaNacimiento: '',
    rol: 'usuario'
  });

  // Usamos viewChild moderno para agarrar el modal nativo <dialog> del HTML
  modalExito = viewChild<ElementRef<HTMLDialogElement>>('modalExito');

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error al traer usuarios de Mongo', err)
    });
  }

  toggleEstatus(usuario: User) {
  const nuevoEstadoEliminado = !usuario.eliminado; // Si estaba en false, pasa a true
  
  this.http.delete(`${this.apiUrl}/${usuario._id}`).subscribe({
    next: () => {
      // Actualizamos la Signal en el front para que la tabla cambie de color y texto al instante
      this.usuarios.update(lista => 
        lista.map(u => u._id === usuario._id ? { ...u, eliminado: nuevoEstadoEliminado } : u)
      );
    },
    error: (err) => console.error('Error al cambiar estatus', err)
  });
}

  crearUsuario() {
    // Validación básica antes de mandar a NestJS
    const fields = this.nuevoUsuario();
    if (!fields.nombre || !fields.correo || !fields.username || !fields.password) {
      alert('Por favor completa los campos obligatorios del feed.');
      return;
    }

    this.http.post<User>(this.apiUrl, fields).subscribe({
      next: (usuarioCreado) => {
        // Añadimos el usuario nuevo a la lista reactiva
        this.usuarios.update(lista => [usuarioCreado, ...lista]);
        
        // Reset del formulario estilo caja limpia
        this.nuevoUsuario.set({
          nombre: '',
          apellido: '',
          correo: '',
          username: '',
          password: '',
          fechaNacimiento: '',
          descripcion: '',
          rol: 'usuario'
        });
      },
      error: (err) => console.error('Error al crear usuario en el backend', err)
    });
  }

  cerrarModal() {
    this.modalExito()?.nativeElement.close();
  }
}
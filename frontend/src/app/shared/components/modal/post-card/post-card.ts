import { Component, input, output, computed } from '@angular/core';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css']
})
export class PostCardComponent {
  post = input.required<Post>();
  currentUserId = input<string | null>(null); // para saber si el post es propio (mostrar botón eliminar)

  likeToggled = output<string>();
  deleteRequested = output<string>();

  esMiPost = computed(() => this.post().autor._id === this.currentUserId());

  nombreCompleto = computed(() => `${this.post().autor.nombre} ${this.post().autor.apellido}`);

  fechaFormateada = computed(() => {
    const fecha = new Date(this.post().createdAt);
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  });

  onLikeClick(): void {
    this.likeToggled.emit(this.post()._id);
  }

  onDeleteClick(): void {
    this.deleteRequested.emit(this.post()._id);
  }
}
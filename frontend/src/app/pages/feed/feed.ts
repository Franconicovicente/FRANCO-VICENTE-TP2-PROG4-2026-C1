import { Component, inject, signal, OnInit } from '@angular/core';
import { PostService } from '../../core/services/post.service';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/modal/post-card/post-card';
import { PostSortBy } from '../../core/models/post.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css']
})
export class FeedComponent implements OnInit {
  postService = inject(PostService);
  private modalService = inject(ModalService);
  authService = inject(AuthService);

  titulo = signal('');
  descripcion = signal('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  publishing = signal(false);
  loadingMore = signal(false);
  sortBy = signal<PostSortBy>('fecha');

  ngOnInit(): void {
    this.cargarFeed();
  }

  private cargarFeed(): void {
    this.postService.loadFirstPage(this.sortBy()).subscribe({
      error: () => {
        this.modalService.showError(
          'No pudimos cargar el feed',
          'Ocurrió un problema al traer las publicaciones. Intentá recargar la página.'
        );
      }
    });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PostSortBy;
    this.sortBy.set(value);
    this.cargarFeed();
  }

  onTituloInput(event: Event): void {
    this.titulo.set((event.target as HTMLInputElement).value);
  }

  onDescripcionInput(event: Event): void {
    this.descripcion.set((event.target as HTMLTextAreaElement).value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.modalService.showError('Formato no permitido', 'La imagen debe ser JPG, PNG o WEBP.');
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

  onPublish(): void {
    const titulo = this.titulo().trim();
    const descripcion = this.descripcion().trim();

    if (!titulo || !descripcion) {
      this.modalService.showError(
        'No se pudo publicar',
        'Completá tanto el título como la descripción antes de publicar.'
      );
      return;
    }

    this.publishing.set(true);

    this.postService.create(titulo, descripcion, this.selectedFile() ?? undefined).subscribe({
      next: (nuevoPost) => {
        this.publishing.set(false);
        this.postService.prependPost(nuevoPost);
        this.titulo.set('');
        this.descripcion.set('');
        this.removeFile();
        this.modalService.showSuccess('¡Publicado!', 'Tu publicación ya está visible en el feed.');
      },
      error: () => {
        this.publishing.set(false);
        this.modalService.showError('Error al publicar', 'No pudimos crear tu publicación. Intentá nuevamente.');
      }
    });
  }

  onLikeToggled(postId: string): void {
    const post = this.postService.posts().find((p) => p._id === postId);
    if (!post) return;

    const accion = post.likedByMe ? this.postService.unlike(postId) : this.postService.like(postId);
    accion.subscribe({
      error: () => {
        this.modalService.showError('No se pudo procesar el like', 'Intentá nuevamente en unos segundos.');
      }
    });
  }

  onDeleteRequested(postId: string): void {
    this.modalService.showConfirm(
      'Eliminar publicación',
      'Esta acción no se puede deshacer. ¿Estás seguro de que querés eliminar esta publicación?',
      () => {
        this.postService.delete(postId).subscribe({
          next: () => this.modalService.showSuccess('Eliminado', 'Tu publicación fue eliminada correctamente.'),
          error: () => this.modalService.showError('No se pudo eliminar', 'No tenés permiso o la publicación ya no existe.')
        });
      },
      'Eliminar',
      'Cancelar'
    );
  }

  onLoadMore(): void {
    this.loadingMore.set(true);
    this.postService.loadMore().subscribe({
      next: () => this.loadingMore.set(false),
      error: () => {
        this.loadingMore.set(false);
        this.modalService.showError('No pudimos cargar más', 'Intentá nuevamente en unos segundos.');
      }
    });
  }
}
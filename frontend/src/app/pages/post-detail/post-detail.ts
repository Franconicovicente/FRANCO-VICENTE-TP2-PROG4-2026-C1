import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private postService = inject(PostService);
  commentService = inject(CommentService);
  authService = inject(AuthService);
  private modalService = inject(ModalService);

  private apiUrl = `${environment.apiUrl}/posts`;

  post = signal<Post | null>(null);
  loadingPost = signal(true);
  loadingMore = signal(false);

  nuevoComentario = signal('');
  publicandoComentario = signal(false);

  // Mientras un comentario está en edición, guardamos su id y el texto temporal por separado
  editandoId = signal<string | null>(null);
  textoEdicion = signal('');

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.router.navigate(['/feed']);
      return;
    }
    this.cargarPost(postId);
    this.cargarComentarios(postId);
  }

  ngOnDestroy(): void {
    // Al salir de la pantalla, limpiamos el estado de comentarios para no mezclarlo
    // con el de otro post la próxima vez que entremos a esta pantalla.
    this.commentService.reset();
  }

  private cargarPost(postId: string): void {
    this.loadingPost.set(true);
    this.http.get<Post>(`${this.apiUrl}/${postId}`).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loadingPost.set(false);
      },
      error: () => {
        this.loadingPost.set(false);
        this.modalService.showError('Publicación no encontrada', 'La publicación que buscás no existe o fue eliminada.');
        this.router.navigate(['/feed']);
      }
    });
  }

  private cargarComentarios(postId: string): void {
    this.commentService.loadFirstPage(postId).subscribe({
      error: () => {
        this.modalService.showError('No pudimos cargar los comentarios', 'Intentá recargar la página.');
      }
    });
  }

  onLoadMoreComments(): void {
    this.loadingMore.set(true);
    this.commentService.loadMore().subscribe({
      next: () => this.loadingMore.set(false),
      error: () => {
        this.loadingMore.set(false);
        this.modalService.showError('No pudimos cargar más comentarios', 'Intentá nuevamente.');
      }
    });
  }

  onComentarioInput(event: Event): void {
    this.nuevoComentario.set((event.target as HTMLTextAreaElement).value);
  }

  onPublicarComentario(): void {
    const mensaje = this.nuevoComentario().trim();
    const post = this.post();
    if (!mensaje || !post) {
      return;
    }

    this.publicandoComentario.set(true);
    this.commentService.create(post._id, mensaje).subscribe({
      next: () => {
        this.publicandoComentario.set(false);
        this.nuevoComentario.set('');
      },
      error: () => {
        this.publicandoComentario.set(false);
        this.modalService.showError('No se pudo comentar', 'Ocurrió un problema al publicar tu comentario.');
      }
    });
  }

  onLikeToggled(): void {
    const post = this.post();
    if (!post) return;

    const accion = post.likedByMe ? this.postService.unlike(post._id) : this.postService.like(post._id);
    accion.subscribe({
      next: () => {
        this.post.set({
          ...post,
          likedByMe: !post.likedByMe,
          likesCount: post.likedByMe ? post.likesCount - 1 : post.likesCount + 1,
        });
      },
      error: () => this.modalService.showError('No se pudo procesar el like', 'Intentá nuevamente.')
    });
  }

  esMiComentario(autorId: string): boolean {
    return autorId === this.authService.currentUser()?._id;
  }

  onStartEdit(commentId: string, mensajeActual: string): void {
    this.editandoId.set(commentId);
    this.textoEdicion.set(mensajeActual);
  }

  onCancelEdit(): void {
    this.editandoId.set(null);
    this.textoEdicion.set('');
  }

  onTextoEdicionInput(event: Event): void {
    this.textoEdicion.set((event.target as HTMLTextAreaElement).value);
  }

  onGuardarEdicion(commentId: string): void {
    const mensaje = this.textoEdicion().trim();
    const post = this.post();
    if (!mensaje || !post) return;

    this.commentService.update(post._id, commentId, mensaje).subscribe({
      next: () => {
        this.editandoId.set(null);
        this.textoEdicion.set('');
      },
      error: () => this.modalService.showError('No se pudo editar', 'Solo podés editar tus propios comentarios.')
    });
  }

  fechaFormateada(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
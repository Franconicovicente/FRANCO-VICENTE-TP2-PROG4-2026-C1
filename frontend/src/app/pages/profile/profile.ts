import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { ModalService } from '../../core/services/modal.service';
import { PostCardComponent } from '../../shared/components/modal/post-card/post-card';
import { Post } from '../../core/models/post.model';

type ProfileTab = 'posts' | 'saved' | 'tagged';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private postService = inject(PostService);
  private modalService = inject(ModalService);

  // El perfil sale directo del usuario logueado (no hay GET /users/me todavía)
  profile = this.authService.currentUser;

  // Últimas 3 publicaciones propias, en un signal local (no usamos el feed general acá)
  myPosts = signal<Post[]>([]);
  loadingPosts = signal(false);

  // Seguidores/seguidos no existen todavía en el back (no hay endpoint de follows)
  postsCount = computed(() => this.myPosts().length);
  followersCount = signal(0);
  followingCount = signal(0);

  activeTab = signal<ProfileTab>('posts');

  ngOnInit(): void {
    this.cargarMisPosts();
  }

  private cargarMisPosts(): void {
    const userId = this.profile()?._id;
    if (!userId) return;

    this.loadingPosts.set(true);
    this.postService.getPostsByUser(userId, 'fecha', 3).subscribe({
      next: (res) => {
        this.myPosts.set(res.posts);
        this.loadingPosts.set(false);
      },
      error: () => {
        this.loadingPosts.set(false);
        this.modalService.showError(
          'No pudimos cargar tus publicaciones',
          'Ocurrió un problema al traer tus últimas publicaciones.'
        );
      }
    });
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  onLikeToggled(postId: string): void {
    const post = this.myPosts().find((p) => p._id === postId);
    if (!post) return;

    const accion = post.likedByMe ? this.postService.unlike(postId) : this.postService.like(postId);
    accion.subscribe({
      next: () => {
        this.myPosts.update((posts) =>
          posts.map((p) =>
            p._id === postId
              ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1 }
              : p
          )
        );
      },
      error: () => this.modalService.showError('No se pudo procesar el like', 'Intentá nuevamente.')
    });
  }

  onDeleteRequested(postId: string): void {
    this.modalService.showConfirm(
      'Eliminar publicación',
      'Esta acción no se puede deshacer. ¿Estás seguro de que querés eliminar esta publicación?',
      () => {
        this.postService.delete(postId).subscribe({
          next: () => {
            this.myPosts.update((posts) => posts.filter((p) => p._id !== postId));
            this.modalService.showSuccess('Eliminado', 'Tu publicación fue eliminada correctamente.');
          },
          error: () => this.modalService.showError('No se pudo eliminar', 'Intentá nuevamente.')
        });
      },
      'Eliminar',
      'Cancelar'
    );
  }

  onEditProfile(): void {
    this.modalService.showInfo(
      'Editar perfil',
      'La edición de perfil todavía no está disponible en esta versión. Próximamente vas a poder actualizar tu foto, nombre y biografía.'
    );
  }

  onChangeAvatar(): void {
    this.modalService.showInfo(
      'Cambiar foto de perfil',
      'La opción para subir una nueva foto de perfil va a estar disponible próximamente.'
    );
  }

  onSettings(): void {
    this.modalService.showInfo(
      'Configuración',
      'La sección de configuración del perfil todavía no está disponible.'
    );
  }
}
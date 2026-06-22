import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { ModalService } from '../../core/services/modal.service';
import { PostCardComponent } from '../../shared/components/modal/post-card/post-card';

type ProfileTab = 'posts' | 'saved' | 'tagged';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  private userService = inject(UserService);
  private postService = inject(PostService);
  private modalService = inject(ModalService);

  profile = this.userService.getProfile();
  myPosts = this.postService.getMyPosts();

  activeTab = signal<ProfileTab>('posts');

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  onLikeToggled(postId: string): void {
    this.postService.toggleLike(postId);
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
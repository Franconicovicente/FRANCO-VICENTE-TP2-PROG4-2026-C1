import { Component, inject, signal } from '@angular/core';
import { PostService } from '../../core/services/post.service';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/modal/post-card/post-card';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PostCardComponent],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css']
})
export class FeedComponent {
  private postService = inject(PostService);
  private modalService = inject(ModalService);
  authService = inject(AuthService);

  posts = this.postService.getFeedPosts();
  newPostContent = signal('');

  onContentInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.newPostContent.set(value);
  }

  onImageClick(): void {
    this.modalService.showInfo(
      'Adjuntar imagen',
      'La opción para adjuntar imágenes a tus publicaciones todavía no está disponible en esta versión.'
    );
  }

  onPublish(): void {
    const content = this.newPostContent().trim();

    if (!content) {
      this.modalService.showError(
        'No se pudo publicar',
        'Escribí algo antes de publicar. Las publicaciones vacías no están permitidas.'
      );
      return;
    }

    this.postService.createPost(content);
    this.newPostContent.set('');
    this.modalService.showSuccess('¡Publicado!', 'Tu publicación ya está visible en el feed.');
  }

  onLikeToggled(postId: string): void {
    this.postService.toggleLike(postId);
  }
}
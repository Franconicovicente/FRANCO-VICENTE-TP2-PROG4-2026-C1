import { Injectable, signal, computed } from '@angular/core';
import { Post } from '../models/post.model';

const CURRENT_USER_ID = 'u1'; // Mock: en el futuro vendrá de AuthService.currentUser()

const MOCK_POSTS: Post[] = [
  {
    id: '3',
    authorId: 'u2',
    authorName: 'Elena Martínez',
    authorAvatarUrl: '',
    content: 'Acabo de terminar mi sesión matutina de diseño. Hay algo increíblemente calmante en trabajar con espacios en blanco y tipografías limpias. ¿Alguien más siente que el minimalismo ayuda a pensar mejor?',
    imageUrl: '',
    createdAt: 'Hace 2 horas',
    likesCount: 124,
    commentsCount: 18,
    likedByMe: false,
  },
  {
    id: '4',
    authorId: 'u3',
    authorName: 'Javier Soler',
    authorAvatarUrl: '',
    content: 'Explorando nuevas formas de conectar sin el ruido de las notificaciones constantes. Serene Social está siendo un cambio de aire necesario.',
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800',
    createdAt: 'Hace 5 horas',
    likesCount: 89,
    commentsCount: 5,
    likedByMe: false,
  },
  {
    id: '1',
    authorId: CURRENT_USER_ID,
    authorName: 'Alex Rivera',
    authorAvatarUrl: '',
    content: 'Rediseñando la experiencia de navegación para un entorno digital más calmado. Menos es siempre más. #minimalismo #uidesign',
    imageUrl: '',
    createdAt: 'Hace 2 horas',
    likesCount: 342,
    commentsCount: 28,
    likedByMe: false,
  },
  {
    id: '2',
    authorId: CURRENT_USER_ID,
    authorName: 'Alex Rivera',
    authorAvatarUrl: '',
    content: 'La simplicidad no es la ausencia de desorden, sino la presencia de claridad. Nueva paleta de colores para el proyecto Serene.',
    imageUrl: '',
    createdAt: 'Ayer',
    likesCount: 156,
    commentsCount: 12,
    likedByMe: false,
  },
];

@Injectable({ providedIn: 'root' })
export class PostService {
  // Mock local con signal; más adelante esto se reemplaza por llamadas HTTP reales (GET /posts, POST /posts, etc.)
  private allPosts = signal<Post[]>(MOCK_POSTS);

  // Feed general: todos los posts, ordenados (los nuevos ya quedan al tope por como los insertamos)
  getFeedPosts() {
    return this.allPosts.asReadonly();
  }

  // Solo los posts del usuario actual, derivado del signal principal con computed()
  getMyPosts() {
    return computed(() => this.allPosts().filter((post) => post.authorId === CURRENT_USER_ID));
  }

  createPost(content: string, imageUrl?: string): void {
    const newPost: Post = {
      id: crypto.randomUUID(),
      authorId: CURRENT_USER_ID,
      authorName: 'Alex Rivera',
      authorAvatarUrl: '',
      content,
      imageUrl: imageUrl ?? '',
      createdAt: 'Ahora',
      likesCount: 0,
      commentsCount: 0,
      likedByMe: false,
    };
    this.allPosts.update((posts) => [newPost, ...posts]);
  }

  toggleLike(postId: string): void {
    this.allPosts.update((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likesCount: post.likedByMe ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
  }
}
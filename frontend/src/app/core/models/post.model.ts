import { User } from './user.model';

// El back devuelve el autor poblado (no solo el ID), con estos campos puntuales
export interface PostAuthor {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  fotoUrl: string;
}

export interface Post {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  autor: PostAuthor;
  likesCount: number;
  createdAt: string;
  likedByMe?: boolean; // se calcula en el front, no viene del back todavía
}

export interface CreatePostDto {
  titulo: string;
  descripcion: string;
}

export type PostSortBy = 'fecha' | 'likes';

export interface PostsResponse {
  posts: Post[];
  total: number;
}
import { PostAuthor } from './post.model';

export interface Comment {
  _id: string;
  mensaje: string;
  publicacion: string;
  autor: PostAuthor;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  comentarios: Comment[];
  total: number;
}
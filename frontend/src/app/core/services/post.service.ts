import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Post, PostsResponse, PostSortBy } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'https://franco-vicente-tp2-prog4-2026-c1.onrender.com/posts';

  // Estado del feed: posts cargados hasta el momento + total que existen en el back
  posts = signal<Post[]>([]);
  total = signal<number>(0);

  // Cuántos posts pedimos por página, y desde dónde arrancar la próxima carga
  private readonly pageSize = 10;
  private currentOffset = 0;
  private currentSort: PostSortBy = 'fecha';
  private currentUsuario: string | undefined;

  get hasMore(): boolean {
    return this.posts().length < this.total();
  }

  // Carga la primera página, reemplazando lo que hubiera (usado al entrar al Feed o al cambiar el orden)
  loadFirstPage(sort: PostSortBy = 'fecha', usuario?: string): Observable<PostsResponse> {
    this.currentOffset = 0;
    this.currentSort = sort;
    this.currentUsuario = usuario;

    return this.fetchPage(0).pipe(
      tap((res) => {
        this.posts.set(res.posts);
        this.total.set(res.total);
        this.currentOffset = res.posts.length;
      })
    );
  }

  // Trae la página siguiente y la agrega al final de lo que ya estaba cargado ("Cargar más")
  loadMore(): Observable<PostsResponse> {
    return this.fetchPage(this.currentOffset).pipe(
      tap((res) => {
        this.posts.update((actuales) => [...actuales, ...res.posts]);
        this.total.set(res.total);
        this.currentOffset += res.posts.length;
      })
    );
  }

  private fetchPage(offset: number): Observable<PostsResponse> {
    let url = `${this.apiUrl}?sort=${this.currentSort}&offset=${offset}&limit=${this.pageSize}`;
    if (this.currentUsuario) {
      url += `&usuario=${this.currentUsuario}`;
    }
    return this.http.get<PostsResponse>(url);
  }

  // Trae los posts de un usuario puntual (usado en Mi Perfil), sin afectar el estado del feed general
  getPostsByUser(usuarioId: string, sort: PostSortBy = 'fecha', limit = 3): Observable<PostsResponse> {
    const url = `${this.apiUrl}?sort=${sort}&offset=0&limit=${limit}&usuario=${usuarioId}`;
    return this.http.get<PostsResponse>(url);
  }

  create(titulo: string, descripcion: string, imagen?: File): Observable<Post> {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    if (imagen) {
      formData.append('imagen', imagen);
    }
    return this.http.post<Post>(this.apiUrl, formData);
  }

  delete(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`).pipe(
      tap(() => {
        this.posts.update((actuales) => actuales.filter((p) => p._id !== postId));
        this.total.update((t) => t - 1);
      })
    );
  }

  like(postId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/like`, {}).pipe(
      tap(() => this.updateLikeLocally(postId, true))
    );
  }

  unlike(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}/like`).pipe(
      tap(() => this.updateLikeLocally(postId, false))
    );
  }

  private updateLikeLocally(postId: string, liked: boolean): void {
    this.posts.update((actuales) =>
      actuales.map((post) =>
        post._id === postId
          ? {
              ...post,
              likedByMe: liked,
              likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
            }
          : post
      )
    );
  }
}
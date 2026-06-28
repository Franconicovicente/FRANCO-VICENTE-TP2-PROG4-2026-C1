import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CommentsResponse } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  comentarios = signal<Comment[]>([]);
  total = signal<number>(0);

  private readonly pageSize = 5;
  private currentOffset = 0;
  private currentPostId: string | null = null;

  get hasMore(): boolean {
    return this.comentarios().length < this.total();
  }

  loadFirstPage(postId: string): Observable<CommentsResponse> {
    this.currentPostId = postId;
    this.currentOffset = 0;

    return this.fetchPage(postId, 0).pipe(
      tap((res) => {
        this.comentarios.set(res.comentarios);
        this.total.set(res.total);
        this.currentOffset = res.comentarios.length;
      })
    );
  }

  loadMore(): Observable<CommentsResponse> {
    if (!this.currentPostId) {
      throw new Error('No hay un post activo para cargar más comentarios');
    }

    return this.fetchPage(this.currentPostId, this.currentOffset).pipe(
      tap((res) => {
        this.comentarios.update((actuales) => [...actuales, ...res.comentarios]);
        this.total.set(res.total);
        this.currentOffset += res.comentarios.length;
      })
    );
  }

  private fetchPage(postId: string, offset: number): Observable<CommentsResponse> {
    const url = `${this.apiUrl}/${postId}/comments?offset=${offset}&limit=${this.pageSize}`;
    return this.http.get<CommentsResponse>(url);
  }

  create(postId: string, mensaje: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, { mensaje }).pipe(
      tap((nuevoComentario) => {
        // Insertamos al tope, ya que el back ordena "más recientes primero"
        this.comentarios.update((actuales) => [nuevoComentario, ...actuales]);
        this.total.update((t) => t + 1);
      })
    );
  }

  update(postId: string, commentId: string, mensaje: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${postId}/comments/${commentId}`, { mensaje }).pipe(
      tap((comentarioActualizado) => {
        this.comentarios.update((actuales) =>
          actuales.map((c) => (c._id === commentId ? comentarioActualizado : c))
        );
      })
    );
  }

  // Limpia el estado al salir de la pantalla de detalle, para no mezclar comentarios entre posts distintos
  reset(): void {
    this.comentarios.set([]);
    this.total.set(0);
    this.currentOffset = 0;
    this.currentPostId = null;
  }
}
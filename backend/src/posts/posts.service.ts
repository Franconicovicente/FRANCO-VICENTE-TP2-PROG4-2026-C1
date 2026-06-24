import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../posts/schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, autorId: string, imagenUrl?: string): Promise<Post> {
    const nuevoPost = new this.postModel({
      ...createPostDto,
      autor: new Types.ObjectId(autorId),
      imagenUrl: imagenUrl || '',
    });
    return nuevoPost.save();
  }

  async findAll(query: QueryPostsDto): Promise<{ posts: any[]; total: number }> {
    const { sort = 'fecha', offset = 0, limit = 10, usuario } = query;

    const filtro: Record<string, any> = { eliminado: false };
    if (usuario) {
      filtro.autor = new Types.ObjectId(usuario);
    }

    const total = await this.postModel.countDocuments(filtro);

    let postsQuery = this.postModel
      .find(filtro)
      .populate('autor', 'nombre apellido username fotoUrl');

    // Para ordenar por fecha usamos el campo automático createdAt (timestamps: true).
    // Para ordenar por likes no podemos usar .sort() directo porque 'likes' es un array
    // (su longitud no es un campo real en Mongo), así que ordenamos en memoria después de traer la página.
    if (sort === 'fecha') {
      postsQuery = postsQuery.sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit));
    } else {
      postsQuery = postsQuery.skip(Number(offset)).limit(Number(limit) * 3); // traemos un poco más para poder ordenar bien antes de cortar
    }

    const posts = await postsQuery.exec();

    let resultado = posts.map((post) => this.toResponseShape(post));

    if (sort === 'likes') {
      resultado = resultado.sort((a, b) => b.likesCount - a.likesCount).slice(0, Number(limit));
    }

    return { posts: resultado, total };
  }

  async remove(postId: string, userId: string, userRol: string): Promise<void> {
    const post = await this.postModel.findById(postId);

    if (!post || post.eliminado) {
      throw new NotFoundException('La publicación no existe');
    }

    const esAutor = post.autor.toString() === userId;
    const esAdmin = userRol === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }

    post.eliminado = true;
    await post.save();
  }

  async addLike(postId: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(postId);

    if (!post || post.eliminado) {
      throw new NotFoundException('La publicación no existe');
    }

    const yaLeDioLike = post.likes.some((id) => id.toString() === userId);
    if (yaLeDioLike) {
      return; // ya tenía like, no hacemos nada (evita duplicados)
    }

    post.likes.push(new Types.ObjectId(userId));
    await post.save();
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(postId);

    if (!post || post.eliminado) {
      throw new NotFoundException('La publicación no existe');
    }

    post.likes = post.likes.filter((id) => id.toString() !== userId);
    await post.save();
  }

  // Da forma consistente a la respuesta que recibe el front
  private toResponseShape(post: any) {
    return {
      _id: post._id,
      titulo: post.titulo,
      descripcion: post.descripcion,
      imagenUrl: post.imagenUrl,
      autor: post.autor,
      likesCount: post.likes?.length ?? 0,
      createdAt: post.createdAt,
    };
  }
}
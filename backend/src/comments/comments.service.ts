import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/crear.comment.dto';
import { UpdateCommentDto } from './dto/actualizar.comment.dto';
import { QueryCommentsDto } from './dto/query.comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(postId: string, dto: CreateCommentDto, autorId: string) {
    const nuevoComentario = new this.commentModel({
      mensaje: dto.mensaje,
      publicacion: new Types.ObjectId(postId),
      autor: new Types.ObjectId(autorId),
    });
    const guardado = await nuevoComentario.save();
    return guardado.populate('autor', 'nombre apellido username fotoUrl');
  }

  async findByPost(postId: string, query: QueryCommentsDto) {
    const { offset = 0, limit = 10 } = query;
    const filtro = { publicacion: new Types.ObjectId(postId) };

    const total = await this.commentModel.countDocuments(filtro);

    const comentarios = await this.commentModel
      .find(filtro)
      .populate('autor', 'nombre apellido username fotoUrl')
      .sort({ createdAt: -1 }) // más recientes primero
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();

    return { comentarios, total };
  }

  async update(commentId: string, dto: UpdateCommentDto, userId: string) {
    const comentario = await this.commentModel.findById(commentId);

    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    const esAutor = comentario.autor.toString() === userId;
    if (!esAutor) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', 'nombre apellido username fotoUrl');
  }
}
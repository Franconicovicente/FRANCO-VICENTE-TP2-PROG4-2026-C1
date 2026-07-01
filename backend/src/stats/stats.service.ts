import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../posts/schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';
import { QueryStatsDto } from './dto/query.stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  // Construye el filtro de fecha en base a "desde"/"hasta", usando el campo createdAt
  private construirFiltroFecha(query: QueryStatsDto): Record<string, any> {
    const filtro: Record<string, any> = {};

    if (query.desde || query.hasta) {
      filtro.createdAt = {};
      if (query.desde) {
        filtro.createdAt.$gte = new Date(query.desde);
      }
      if (query.hasta) {
        // Le sumamos un día para que "hasta" incluya todo ese día completo
        const hasta = new Date(query.hasta);
        hasta.setDate(hasta.getDate() + 1);
        filtro.createdAt.$lt = hasta;
      }
    }

    return filtro;
  }

  // 1. Cantidad de publicaciones por usuario, en el rango de fechas elegido
  async postsPorUsuario(query: QueryStatsDto) {
    const filtroFecha = this.construirFiltroFecha(query);

    const resultado = await this.postModel.aggregate([
      { $match: { eliminado: false, ...filtroFecha } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          username: '$usuario.username',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    return resultado;
  }

  // 2. Cantidad de comentarios totales, agrupados por día, en el rango de fechas elegido
  async comentariosPorFecha(query: QueryStatsDto) {
    const filtroFecha = this.construirFiltroFecha(query);

    const resultado = await this.commentModel.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
    ]);

    return resultado;
  }

  // 3. Cantidad de comentarios por cada publicación, en el rango de fechas elegido
  async comentariosPorPublicacion(query: QueryStatsDto) {
    const filtroFecha = this.construirFiltroFecha(query);

    const resultado = await this.commentModel.aggregate([
      { $match: filtroFecha },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    return resultado;
  }
}
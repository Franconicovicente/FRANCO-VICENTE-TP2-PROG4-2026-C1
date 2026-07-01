import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { QueryStatsDto } from './dto/query.stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('posts-por-usuario')
  postsPorUsuario(@Query() query: QueryStatsDto) {
    return this.statsService.postsPorUsuario(query);
  }

  @Get('comentarios-por-fecha')
  comentariosPorFecha(@Query() query: QueryStatsDto) {
    return this.statsService.comentariosPorFecha(query);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: QueryStatsDto) {
    return this.statsService.comentariosPorPublicacion(query);
  }
}
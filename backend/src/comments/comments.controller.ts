import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/crear.comment.dto';
import { UpdateCommentDto } from './dto/actualizar.comment.dto';
import { QueryCommentsDto } from './dto/query.comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

// Las rutas cuelgan de /posts/:postId/comments para dejar clara la relación con la publicación
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(postId, dto, user.uuid);
  }

  @Get()
  findByPost(@Param('postId') postId: string, @Query() query: QueryCommentsDto) {
    return this.commentsService.findByPost(postId, query);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.update(commentId, dto, user.uuid);
  }
}
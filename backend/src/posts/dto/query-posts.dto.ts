export class QueryPostsDto {
  sort?: 'fecha' | 'likes' = 'fecha';
  offset?: number = 0;
  limit?: number = 10;
  usuario?: string; // filtra por id de autor, opcional
}
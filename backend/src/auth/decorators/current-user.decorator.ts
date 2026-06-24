import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../strategies/jwt.strategy';

// Permite usar @CurrentUser() directamente como parámetro en cualquier método
// de un controller protegido con JwtAuthGuard, en vez de tener que escribir
// @Req() req y luego acceder a req.user manualmente.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
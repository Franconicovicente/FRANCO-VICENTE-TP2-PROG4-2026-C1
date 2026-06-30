import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // ya viene poblado por el JwtAuthGuard

    if (!user || user.rol !== 'administrador') {
      throw new ForbiddenException('Esta acción requiere permisos de administrador');
    }

    return true;
  }
}
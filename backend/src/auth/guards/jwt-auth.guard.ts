import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 'jwt' hace referencia al nombre por defecto que le da Passport a la estrategia
// que extiende PassportStrategy(Strategy) en jwt.strategy.ts.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Esto define qué forma tiene el payload que guardamos al firmar el token
// en auth.service.ts (login): { uuid, correo, username, rol }
export interface JwtPayload {
  uuid: string;
  correo: string;
  username: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Le decimos a Passport que busque el token en el header:
      // Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // si el token expiró (15 min), lo rechaza automáticamente
      secretOrKey: configService.get<string>('JWT_SECRET') || 'claveSecretaSuperSecreta',
    });
  }

  // Esto se ejecuta automáticamente DESPUÉS de que Passport verificó la firma y la expiración.
  // Lo que devolvemos aquí queda disponible como req.user en los controllers.
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
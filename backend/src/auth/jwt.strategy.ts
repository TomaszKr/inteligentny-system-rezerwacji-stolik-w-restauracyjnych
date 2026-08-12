import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getJwtSecret } from '../config/jwt-secret';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    // Weryfikacja tokenVersion — unieważnienie sesji (#78, OWASP A07).
    // Token z nieaktualnym tv (po logout/zmianie) jest odrzucany.
    const user = await this.usersService.findOne(payload.sub);
    if (!user || (payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Sesja wygasła lub została unieważniona');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}

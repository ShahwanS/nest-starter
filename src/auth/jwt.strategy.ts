// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Optional, default is false
      secretOrKey: 'SECRET_KEY', // Replace with your own secret
    });
  }

  async validate(payload: any) {
    // You can add additional validation logic here
    return { userId: payload.sub, username: payload.username };
  }
}

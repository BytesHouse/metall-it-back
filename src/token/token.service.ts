import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenPayload } from './entities/token-payload.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(
    payload: string | object | Buffer,
    options?: JwtSignOptions | undefined,
  ): Promise<string> {
    return this.jwtService.signAsync(payload.toString(), options);
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      return (await this.jwtService.verifyAsync(token)) as TokenPayload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

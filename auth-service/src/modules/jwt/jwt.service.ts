import { Injectable } from '@nestjs/common';
import { JwtService as TokenService } from '@nestjs/jwt';

@Injectable()
export class JwtService<T extends object = any> {
  constructor(private readonly tokenService: TokenService) {}

  async getToken(payload: T): Promise<string> {
    const token: string = await this.tokenService.signAsync(payload, {
      expiresIn: '24h',
    });
    return token;
  }

  async verify(token: string): Promise<T> {
    return await this.tokenService.verifyAsync(token);
  }
}

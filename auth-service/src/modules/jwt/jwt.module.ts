import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as TokenModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [JwtService],
  imports: [
    TokenModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtService],
})
export class JwtModule {}

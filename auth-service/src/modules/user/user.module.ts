import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDao } from './user.dao';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  providers: [UserService, UserDao],
  controllers: [UserController],
  imports: [JwtModule],
  exports: [UserService],
})
export class UserModule {}

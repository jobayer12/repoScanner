import { Scope } from '@nestjs/common';
import { JwtService } from '../../modules/jwt/jwt.service';
import { REQUEST } from '@nestjs/core';
export default {
  provide: 'LOGGED_IN_USER',
  scope: Scope.REQUEST,
  useFactory: async (request, jwtService: JwtService) => {
    const authorization = request.get('Authorization')?.split(' ')[1] || '';
    try {
      let userDetails: any;
      if (authorization) {
        userDetails = await jwtService.verify(authorization);
      } else {
        userDetails = '';
      }
      return userDetails;
    } catch (e) {
      console.log('Logged in user error:', e);
    }
    return null;
  },
  inject: [REQUEST, JwtService],
};

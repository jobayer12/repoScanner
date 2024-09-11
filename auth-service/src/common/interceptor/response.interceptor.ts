import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable({ scope: Scope.DEFAULT })
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((responseData) => {
        return {
          message: '',
          result: responseData ?? null,
        };
      }),
    );
  }
}

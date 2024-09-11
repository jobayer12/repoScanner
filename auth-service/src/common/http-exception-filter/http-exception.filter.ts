import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    let errorMessage = (<any>exception.getResponse()).message;

    if (errorMessage && Array.isArray(errorMessage)) {
      errorMessage = errorMessage.join(', ');
    }

    response.status(status).json({
      message: errorMessage,
      result: null,
    });
  }
}

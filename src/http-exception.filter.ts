import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | { message: any; statusCode: number }
      | { error: string; statusCode: 400; message: string[] };

    // 에러메시지 포멧팅
    if (typeof error !== 'string' && error.statusCode === 400) {
      return response.status(status).json({
        success: false,
        code: status,
        data: error.message,
      });
    }

    response.status(status).json({
      success: false,
      code: status,
      data: error.message,
    });
  }
}

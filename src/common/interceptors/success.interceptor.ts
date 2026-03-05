import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode || HttpStatus.OK,
        path: request.url,
        timestamp: new Date().toISOString(),
        data: data,
      })),
    );
  }
}

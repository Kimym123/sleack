import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// 마지막에 완료된 return 데이터가 undefined 라면 null 로 바꿔주는 기능의 인터셉터
// Json 은 null 만 취급하기 때문에 이러한 작업을 거친다.
@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next
      .handle()
      .pipe(map((data) => (data === undefined ? null : data)));
  }
}

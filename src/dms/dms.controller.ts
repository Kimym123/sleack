import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DmsService } from './dms.service';

@Controller('api/workspaces/:url/dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  // 특정 DM 채팅 가져오기
  @Get(':id/chats')
  getChat(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  // 특정 DM 채팅 생성하기
  @Post(':id/chars')
  postChat(@Body() body) {}
}

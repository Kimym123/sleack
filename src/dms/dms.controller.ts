import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DmsService } from './dms.service';

@Controller('api/workspaces/:url/dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @Get(':id/chats')
  getChat(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  @Post(':id/chars')
  postChat(@Body() body) {}
}

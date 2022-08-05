import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';

@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // 모든 채널 가져오기
  @Get()
  getAllChannels() {}

  // 채널 생성하기
  @Post()
  createChannel() {}

  // 특정 채널 가져오기 가져오기
  @Get()
  getSpecificChannel() {}

  //채팅 가져오기
  @Get(':name/chats')
  getChats(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  // 채널 채팅 생성하기
  @Post(':name/chats')
  postChat(@Body() body) {}

  // 모든 멤버 가져오기
  @Get()
  getAllMembers() {}

  // 멤버 초대하기
  @Post(':name/members')
  inviteMembers() {}
}

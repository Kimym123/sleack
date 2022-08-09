import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { User } from '../common/decorators/user.decorator';
import { PostChatDto } from './dto/post-chat.dto';

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
  @Get(':name')
  getSpecificChannel(@Param('name') name: string) {}

  //채팅 가져오기
  @Get(':name/chats')
  getChats(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query() query,
    @Param() param,
  ) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
    return this.channelsService.getWorkspaceChannelChats(
      url,
      name,
      query.perPage,
      query.page,
    );
  }

  // 채널 채팅 생성하기 -> 웹소켓 사용
  @Post(':name/chats')
  postChat(
    @Param('url') url: string,
    @Param('name') name: string,
    @Body() body: PostChatDto,
    @User() user,
  ) {
    return this.channelsService.postChat({
      url,
      name,
      content: body.content,
      myId: user.id,
    });
  }

  // 이미지 업로드 -> 멀터 사용
  @Post(':name/images')
  postImages(@Body() body) {}

  // 카톡처럼 읽지 않은 메시지가 몇개인지 알려주는 기능
  @Get(':name/unreads')
  getUnreads(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query('after') after: number,
  ) {
    return this.channelsService.getChannelUnreadsCount(url, name, after);
  }

  // 모든 멤버 가져오기
  @Get(':name/members')
  getAllMembers(@Param('url') url: string, @Param('name') name: string) {
    return this.channelsService.getWorkspaceChannelMembers(url, name);
  }

  // 멤버 초대하기
  @Post(':name/members')
  inviteMembers() {}
}

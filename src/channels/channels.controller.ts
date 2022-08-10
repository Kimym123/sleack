import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { User } from '../common/decorators/user.decorator';
import { PostChatDto } from './dto/post-chat.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { Users } from '../entities/Users';
import { CreateChannelDto } from './dto/create-channel.dto';

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어서 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

@ApiTags('CHANNELS')
@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @ApiOperation({ summary: '워크스페이스 채널 모두 가져오기' })
  @Get()
  async getAllChannels(@Param('url') url: string, @User() user: Users) {
    return this.channelsService.getWorkspaceChannels(url, user.id);
  }

  @ApiOperation({ summary: '채널 생성하기' })
  @Post()
  async createChannel(
    @Param('url') url: string,
    @Body() body: CreateChannelDto,
    @User() user: Users,
  ) {
    return this.channelsService.createWorkspaceChannels(
      url,
      body.name,
      user.id,
    );
  }

  @ApiOperation({ summary: '특정 채널 가져오기 가져오기' })
  @Get(':name')
  async getSpecificChannel(
    @Param('url') url: string,
    @Param('name') name: string,
  ) {
    return this.channelsService.getWorkspaceChannel(url, name);
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널의 채팅을 모두 가져오기' })
  @Get(':name/chats')
  async getSpecificChannelChats(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.channelsService.getWorkspaceChannelChats(
      url,
      name,
      perPage,
      page,
    );
  }

  @ApiOperation({ summary: '워크스페이스에서 특정 채널의 채팅 생성하기' }) // 웹소켓 활용된다.
  @Post(':name/chats')
  async postChat(
    @Param('url') url: string,
    @Param('name') name: string,
    @Body() body: PostChatDto,
    @User() user: Users,
  ) {
    return this.channelsService.postChat({
      url,
      name,
      content: body.content,
      myId: user.id,
    });
  }

  @ApiOperation({ summary: '워크스페이스에서 특정 채널의 이미지 업로드' }) // 멀터와 웹소켓이 활용된다.
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: multer.diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @Post(':name/images')
  async postImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('url') url: string,
    @Param('name') name: string,
    @User() user,
  ) {
    return this.channelsService.createWorkspaceChannelImages(
      url,
      name,
      files,
      user.id,
    );
  }

  @ApiOperation({ summary: '읽지 않은 메시지 개수 가져오기' })
  @Get(':name/unreads')
  async getUnreads(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query('after', ParseIntPipe) after: number,
  ) {
    return this.channelsService.getChannelUnreadsCount(url, name, after);
  }

  @ApiOperation({ summary: '워크스페이스의 채널 멤버 가져오기' })
  @Get(':name/members')
  async getAllMembers(@Param('url') url: string, @Param('name') name: string) {
    return this.channelsService.getWorkspaceChannelMembers(url, name);
  }

  @ApiOperation({ summary: '워크스페이스에 채널 멤버 초대하기' })
  @Post(':name/members')
  async inviteMembers(
    @Param('url') url: string,
    @Param('name') name: string,
    @Body('email') email: string,
  ) {
    return this.channelsService.createWorkspaceChannelMembers(url, name, email);
  }
}

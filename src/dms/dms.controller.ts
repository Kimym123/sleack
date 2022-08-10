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
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Users } from '../entities/Users';
import { User } from '../common/decorators/user.decorator';
import * as fs from 'fs';
import { DmsService } from './dms.service';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import path from 'path';

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어서 uploads 폴더를 생성한다.');
  fs.mkdirSync('uploads');
}

@ApiTags('DMS')
@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces')
export class DmsController {
  constructor(private dmsService: DmsService) {}

  @ApiOperation({ summary: '워크스페이스에서 DM 모두 가져오기' })
  @Get(':url/dms')
  async getWorkspaceChannels(@Param('url') url: string, @User() user: Users) {
    return this.dmsService.getWorkspaceDMs(url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스에서 특정 DM 채팅을 모두 가져오기' })
  @Get(':id/chats')
  async getWorkspaceDMChats(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
    @User() user: Users,
  ) {
    return this.dmsService.getWorkspaceDMChats(url, id, user.id, perPage, page);
  }

  @ApiOperation({ summary: '워크스페이스에서 특정 DM 채팅을 생성하기' })
  @Post(':id/chats')
  async createWorkspaceDMChats(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @User() user: Users,
  ) {
    return this.dmsService.createWorkspaceDMChats(url, content, id, user.id);
  }

  @ApiOperation({ summary: '워크스페이스에서 특정 DM 이미지를 업로드하기' })
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @Post(':id/images')
  async createWorkspaceDMImages(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: Users,
  ) {
    return this.dmsService.createWorkspaceDMImages(url, files, id, user.id);
  }

  @ApiOperation({ summary: '안 읽은 메시지 개수 가져오기' })
  @Get(':id/unreads')
  async getUnReads(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('after', ParseIntPipe) after: number,
    @User() user: Users,
  ) {
    return this.dmsService.getDmUnReadsCount(url, id, user.id, after);
  }
}

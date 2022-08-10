import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { User } from '../common/decorators/user.decorator';
import { Users } from '../entities/Users';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from '../auth/logged-in.guard';

@ApiTags('WORKSPACES')
@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @ApiOperation({ summary: '내 워크스페이스를 가져오기' })
  @Get()
  async getMyWorkspaces(@User() user: Users) {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  @ApiOperation({ summary: '워크스페이스 만들기' })
  @Post()
  async createWorkspace(@User() user: Users, @Body() body: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace(body.name, body.url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스의 멤버 전부를 가져오기' })
  @Get(':url/members')
  async getAllMembersFromWorkspace(@Param('url') url: string) {
    return this.workspacesService.getWorkspaceMembers(url);
  }

  @ApiOperation({ summary: '워크스페이스에 멤버 초대하기' })
  @Post(':url/members')
  async inviteMembersToWorkspace(
    @Param('url') url: string,
    @Body('email') email: string,
  ) {
    return this.workspacesService.createWorkspaceMembers(url, email);
  }

  @ApiOperation({ summary: '워크스페이스에서 멤버 강퇴' })
  @Delete(':url/members/:id')
  async kickMemberFromWorkspace() {}

  @ApiOperation({ summary: '워크스페이스에서 특정 멤버 가져오기' })
  @Get(':url/members/:id')
  async getMemberInfoInWorkspace(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workspacesService.getWorkspaceMember(url, id);
  }
}

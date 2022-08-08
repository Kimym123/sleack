import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { User } from '../common/decorators/user.decorator';
import { Users } from '../entities/Users';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // 내 워크스페이스 가져오기
  @Get()
  getMyWorkspaces(@User() user: Users) {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  // 워크스페이스 만들기
  @Post()
  createWorkspace(@User() user: Users, @Body() body: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace(body.name, body.url, user.id);
  }

  // 워크스페이스에 있는 모든 멤버 가져오기
  @Get(':url/members')
  getAllMembersFromWorkspace() {}

  // 워크스페이스에 멤버 초대하기
  @Post(':url/members')
  inviteMembersToWorkspace() {}

  // 워크스페이스에 멤버 강퇴하기
  @Delete(':url/members/:id')
  kickMemberFromWorkspace() {}

  // 워크스페이스 특정멤버 가져오기
  @Get(':url/members/:id')
  getMemberInfoInWorkspace() {}
}

import { Controller, Delete, Get, Post } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // 내 워크스페이스 가져오기
  @Get()
  getMyWorkspaces() {}

  // 워크스페이스 만들기
  @Post()
  createWorkspace() {}

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

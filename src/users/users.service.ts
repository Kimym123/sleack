import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { WorkspaceMembers } from '../entities/WorkspaceMembers';
import { ChannelMembers } from '../entities/ChannelMembers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,

    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,

    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.find({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async join(email: string, nickname: string, password: string) {
    // Validator 을 사용하여 해당 인자가 안들어온 경우에 대해서 필터링을 하였음.

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email } });

    if (user) {
      throw new UnauthorizedException('이미 존재하는 사용자입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const returned = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashedPassword,
      });

      const workspaceMember = queryRunner.manager
        .getRepository(WorkspaceMembers)
        .create();
      workspaceMember.UserId = returned.id;
      workspaceMember.WorkspaceId = 1;
      await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .save(workspaceMember);

      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: returned.id,
        ChannelId: 1,
      });
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

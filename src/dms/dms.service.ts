import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspaces } from '../entities/Workspaces';
import { Repository } from 'typeorm';
import { DMs } from '../entities/DMs';
import { Users } from '../entities/Users';

@Injectable()
export class DmsService {
  constructor(
    @InjectRepository(Workspaces)
    private workspaceRepository: Repository<Workspaces>,

    @InjectRepository(DMs)
    private dmsRepository: Repository<DMs>,

    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async getWorkspaceDMs(url: string, myId: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.dms', 'dms', 'dms.senderId = :myId', { myId })
      .leftJoin('dms', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  async getWorkspaceDMChats(
    url: string,
    id: number,
    myId: number,
    perPage: number,
    page: number,
  ) {
    return (
      this.dmsRepository
        .createQueryBuilder('dms')
        .innerJoinAndSelect('dms.Sender', 'sender')
        .innerJoinAndSelect('dms.Receiver', 'receiver')
        // ###
        .innerJoin('dms.Workspaces', 'workspace')
        .where('workspace.url = :url', { url })
        .andWhere(
          '((dms.SenderId = :myId AND dms.ReceiverId = :id) OR (dms.ReceiverId = :myId AND dms.SenderId = :id))',
          { id, myId },
        )
        .orderBy('dms.createdAt', 'DESC')
        .take(perPage)
        .skip(perPage * (page - 1))
        .getMany()
    );
  }
}

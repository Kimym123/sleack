import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspaces } from '../entities/Workspaces';
import { MoreThan, Repository } from 'typeorm';
import { DMs } from '../entities/DMs';
import { Users } from '../entities/Users';
import { EventsGateway } from '../events/events.gateway';
import { onlineMap } from '../events/onlineMap';

// onlineMap(소켓아이디: 내 아이디 꼴)에서 내 아이디가 들어있는 소켓 아이디를 찾아낸다.
function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

@Injectable()
export class DmsService {
  constructor(
    @InjectRepository(Workspaces)
    private workspaceRepository: Repository<Workspaces>,

    @InjectRepository(DMs)
    private dmsRepository: Repository<DMs>,

    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    private readonly eventsGateway: EventsGateway,
  ) {}

  // 워크스페이스 안에서 내 아이디로 보낸 DM들 가져오기
  async getWorkspaceDMs(url: string, myId: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.dms', 'dms', 'dms.senderId = :myId', { myId })
      .leftJoin('dms', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  // 워크스페이스 내에서 특정 아이디에 해당하는 DM 채팅 모두 가져오기
  async getWorkspaceDMChats(
    url: string,
    id: number,
    myId: number,
    perPage: number,
    page: number,
  ) {
    return this.dmsRepository
      .createQueryBuilder('dms')
      .innerJoinAndSelect('dms.Sender', 'sender')
      .innerJoinAndSelect('dms.Receiver', 'receiver')
      .innerJoin('dms.Workspaces', 'workspace')
      .where('workspace.url = :url', { url })
      .andWhere(
        '((dms.SenderId = :myId AND dms.ReceiverId = :id) OR (dms.ReceiverId = :myId AND dms.SenderId = :id))',
        { id, myId },
      )
      .orderBy('dms.createdAt', 'DESC')
      .take(perPage)
      .skip(perPage * (page - 1))
      .getMany();
  }

  // 워크스페이스 특정 DM 채팅을 생성하기
  async createWorkspaceDMChats(
    url: string,
    content: string,
    id: number,
    myId: number,
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { url },
    });
    const dm = new DMs();
    dm.SenderId = myId;
    dm.ReceiverId = id;
    dm.content = content;
    dm.WorkspaceId = workspace.id;
    const savedDm = await this.dmsRepository.save(dm);

    const dmWithSender = await this.dmsRepository.findOne({
      where: { id: savedDm.id },
      relations: ['Sender'],
    });

    const receiverSocketId = getKeyByValue(
      onlineMap[`/ws-${workspace.url}`],
      Number(id),
    );
    this.eventsGateway.server.to(receiverSocketId).emit('dm', dmWithSender);
  }

  // 워크스페이스에서 특정 DM 이미지를 업로드하기
  async createWorkspaceDMImages(
    url: string,
    files: Express.Multer.File[],
    id: number,
    myId: number,
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { url },
    });
    for (let i = 0; i < files.length; i++) {
      const dm = new DMs();
      dm.SenderId = myId;
      dm.ReceiverId = id;
      dm.content = files[i].path;
      dm.WorkspaceId = workspace.id;
      const savedDm = await this.dmsRepository.save(dm);

      const dmWithSender = await this.dmsRepository.findOne({
        where: { id: savedDm.id },
        relations: ['Sender'],
      });

      const receiverSocketId = getKeyByValue(
        onlineMap[`/ws-${workspace.url}`],
        Number(id),
      );
      this.eventsGateway.server.to(receiverSocketId).emit('dm', dmWithSender);
    }
  }

  // 안 읽은 메시지 개수 가져오기
  async getDmUnReadsCount(
    url: string,
    id: number,
    myId: number,
    after: number,
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { url },
    });
    return this.dmsRepository.count({
      where: {
        WorkspaceId: workspace.id,
        SenderId: id,
        ReceiverId: myId,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }
}

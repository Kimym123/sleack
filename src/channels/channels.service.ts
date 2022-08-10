import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channels } from '../entities/Channels';
import { MoreThan, Repository } from 'typeorm';
import { ChannelMembers } from '../entities/ChannelMembers';
import { Workspaces } from '../entities/Workspaces';
import { ChannelChats } from '../entities/ChannelChats';
import { Users } from '../entities/Users';
import { EventsGateway } from '../events/events.gateway';
import { DMs } from '../entities/DMs';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,

    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,

    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,

    @InjectRepository(ChannelChats)
    private channelChatsRepository: Repository<ChannelChats>,

    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    private eventsGateway: EventsGateway,
  ) {}

  async findById(id: number) {
    return this.channelsRepository.findOne({ where: { id } });
  }

  // 워크스페이스 채널 모두 가져오기
  async getWorkspaceChannels(url: string, myId: number) {
    return this.channelsRepository
      .createQueryBuilder('channels')
      .innerJoinAndSelect(
        'channels.ChannelMembers',
        'channelMembers',
        'channelMembers.userId = :myId',
        { myId },
      )
      .innerJoinAndSelect(
        'channels.Workspaces',
        'workspace',
        'workspace.url = :url',
        { url },
      )
      .getMany();
  }

  // 워크스페이스 특정 체널 가져오기
  async getWorkspaceChannel(url: string, name: string) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
  }

  async createWorkspaceChannels(url: string, name: string, myId: number) {
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
    });

    const channel = new Channels();
    channel.name = name;
    channel.WorkspaceId = workspace.id;
    const channelReturned = await this.channelsRepository.save(channel);

    const channelMember = new ChannelMembers();
    channelMember.UserId = myId;
    channelMember.ChannelId = channelReturned.id;
    await this.channelMembersRepository.save(channelMember);
  }

  // 워크스페이스의 채널 멤버 가져오기
  async getWorkspaceChannelMembers(url: string, name: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.Channels', 'channels', 'channels.name = :name', { name })
      .innerJoin('channels.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getMany();
  }

  // 워크스페이스 채널 멤버 초대하기
  async createWorkspaceChannelMembers(
    url: string,
    name: string,
    email: string,
  ) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    if (!channel) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .innerJoin('user.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getOne();
    if (!user) {
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    }

    const channelMember = new ChannelMembers();
    channelMember.ChannelId = channel.id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);
  }

  async getWorkspaceChannelChats(
    url: string,
    name: string,
    perPage: number,
    page: number,
  ) {
    return this.channelChatsRepository
      .createQueryBuilder('channelChats')
      .innerJoin('channelChats.Channels', 'channel', 'channel.name = :name', {
        name,
      })
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .innerJoinAndSelect('channelChats.Users', 'user')
      .orderBy('channelChats.createdAt', 'DESC')
      .take(perPage)
      .skip(perPage * (page - 1))
      .getMany();
  }

  async getChannelUnreadsCount(url, name, after) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    return this.channelChatsRepository.count({
      where: {
        ChannelId: channel.id,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }

  async postChat({ url, name, content, myId }) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    if (!channel) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    const chats = new ChannelChats();
    chats.content = content;
    chats.UserId = myId;
    chats.ChannelId = channel.id;
    const savedChat = await this.channelChatsRepository.save(chats);
    const chatWithUser = await this.channelChatsRepository.findOne({
      where: { id: savedChat.id },
      relations: ['Users', 'Channels'],
    });
    this.eventsGateway.server
      .to(`/ws-${url}-${channel.id}`)
      .emit('message', chatWithUser);
  }

  async createWorkspaceChannelImages(
    url: string,
    name: string,
    files: Express.Multer.File[],
    myId: number,
  ) {
    console.log(files);
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    if (!channel) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }
    for (let i = 0; i < files.length; i++) {
      const chats = new ChannelChats();
      chats.content = files[i].path;
      chats.UserId = myId;
      chats.ChannelId = channel.id;
      const savedChat = await this.channelChatsRepository.save(chats);

      const chatWithUser = await this.channelChatsRepository.findOne({
        where: { id: savedChat.id },
        relations: ['Users', 'Channels'],
      });
      this.eventsGateway.server
        .to(`/ws-${url}-${channel.id}`)
        .emit('message', chatWithUser);
    }
  }
}

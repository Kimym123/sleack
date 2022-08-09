import { PickType } from '@nestjs/mapped-types';
import { ChannelChats } from '../../entities/ChannelChats';

export class PostChatDto extends PickType(ChannelChats, ['content']) {}

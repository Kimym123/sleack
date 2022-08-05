import { Controller } from '@nestjs/common';
import { ChannelsService } from './channels.service';

@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}
}

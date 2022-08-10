import { Module } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspaces } from '../entities/Workspaces';
import { DMs } from '../entities/DMs';
import { Users } from '../entities/Users';
import { EventsModule } from '../events/events.module';
import { DmsController } from './dms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workspaces, DMs, Users]), EventsModule],
  controllers: [DmsController],
  providers: [DmsService],
})
export class DmsModule {}

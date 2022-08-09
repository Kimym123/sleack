import { Module } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspaces } from '../entities/Workspaces';
import { DMs } from '../entities/DMs';
import { Users } from '../entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Workspaces, DMs, Users])],
  controllers: [DmsController],
  providers: [DmsService],
})
export class DmsModule {}

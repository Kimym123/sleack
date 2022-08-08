import { IsNotEmpty, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { Workspaces } from '../../entities/Workspaces';

export class CreateWorkspaceDto extends PickType(Workspaces, [
  'name',
  'url',
] as const) {
  // @IsString()
  // @IsNotEmpty()
  // public workspace: string;
  //
  // @IsString()
  // @IsNotEmpty()
  // public url: string;
}

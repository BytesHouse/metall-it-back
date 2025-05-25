import { FoundUserType } from '../users.constants';
import { FoundUserDto } from './found-user.dto';

export class FoundUsersDto {
  users: FoundUserDto[];

  constructor(objs: FoundUserType[]) {
    this.users = objs.map((o) => new FoundUserDto(o));
  }
}

import { FoundUserNonPrivateType } from '../users.constants';
import { FoundUserNonPrivatedDto } from './found-user-non-private.dto';

export class FoundUsersNonPrivateDto {
  users: FoundUserNonPrivatedDto[];

  constructor(objs: FoundUserNonPrivateType[]) {
    this.users = objs.map((o) => new FoundUserNonPrivatedDto(o));
  }
}

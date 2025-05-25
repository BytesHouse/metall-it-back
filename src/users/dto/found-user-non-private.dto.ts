import { UserData } from '../entities/user.entity';
import { FoundUserNonPrivateType } from '../users.constants';

export class FoundUserNonPrivatedDto
  implements Pick<UserData, 'id' | 'fullName'>
{
  public id: string;
  public fullName: string;
  public email: string | null;

  constructor(obj: FoundUserNonPrivateType) {
    this.id = obj.id;
    this.fullName = obj.fullName;
    this.email = obj.email;
  }
}

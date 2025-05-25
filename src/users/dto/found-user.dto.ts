import { AddressData } from '../entities/address.entity';
import { UserData } from '../entities/user.entity';
import { FoundUserType } from '../users.constants';
import { Role } from 'src/auth/enums/role.enum';

export class FoundUserDto implements Omit<UserData, 'hash'>, AddressData {
  public id: string;
  public companyId: string;
  public username: string;
  public fullName: string;
  public role: string;
  public email: string | null;
  public phone: string | null;
  public active: boolean;
  public notes: string | null;
  public state: string | null;
  public city: string | null;
  public zip: string | null;
  public address1: string | null;
  public address2: string | null;
  public method: string | null;

  constructor(obj: FoundUserType) {
    this.id = obj.id;
    this.companyId = obj.companyId;
    this.username = obj.username;
    this.fullName = obj.fullName;
    this.role = obj.userGroup?.group?.role || Role.User;
    this.email = obj.email;
    this.phone = obj.phone;
    this.active = obj.active;
    this.notes = obj.notes;
    this.method = obj.method;
    this.state = obj.address?.state || null;
    this.city = obj.address?.city || null;
    this.zip = obj.address?.zip || null;
    this.address1 = obj.address?.address1 || null;
    this.address2 = obj.address?.address2 || null;
  }
}

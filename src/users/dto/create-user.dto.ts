import { AddressData } from '../entities/address.entity';
import { UserData } from '../entities/user.entity';

export class CreateUserDto implements Omit<UserData, 'id'>, AddressData {
  companyId: string;
  hash: string;
  username: string;
  email: string | null;
  fullName: string;
  role: string;
  phone: string | null;
  active: boolean;
  notes: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  address1: string | null;
  address2: string | null;
  method: string | null;
  permissions: Permissions;
}

import { AddressData } from './entities/address.entity';
import { UserData } from './entities/user.entity';
import { Group } from './entities/user_group.entity';

export type FoundUserType = UserData & { address: AddressData } & {
  userGroup: Group | null;
};

export type FoundUserNonPrivateType = Pick<
  UserData,
  'id' | 'fullName' | 'email'
>;

export const emptyUser: UserData & { address: AddressData } & {
  userGroup: Group | null;
} = {
  id: '',
  companyId: '',
  hash: '',
  username: '',
  fullName: '',
  email: null,
  phone: null,
  active: false,
  notes: null,
  address: {
    state: null,
    city: null,
    zip: null,
    address1: null,
    address2: null,
  },
  userGroup: null,
  method: null,
};

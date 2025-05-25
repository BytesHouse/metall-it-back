import { User as UserOrm } from '@prisma/client';

export class User
  implements Omit<UserOrm, 'createdAt' | 'updatedAt' | 'permissionsId'>
{
  constructor(
    public id: string,
    public companyId: string,
    public addressId: string,
    public hash: string,
    public username: string,
    public fullName: string,
    public email: string | null,
    public phone: string | null,
    public active: boolean,
    public notes: string | null,
    public method: string | null,
  ) {}
}

export type UserData = Omit<User, 'addressId'>;

export type UserSearch = Partial<
  Pick<User, 'id' | 'companyId' | 'username' | 'email'>
>;

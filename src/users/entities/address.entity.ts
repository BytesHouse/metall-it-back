import { Address as AddressOrm } from '@prisma/client';

export class Address implements Omit<AddressOrm, 'createdAt' | 'updatedAt'> {
  constructor(
    public id: string,
    public state: string | null,
    public city: string | null,
    public zip: string | null,
    public address1: string | null,
    public address2: string | null,
  ) {}
}

export type AddressData = Omit<Address, 'id'>;

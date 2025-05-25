import { Group as GroupOrm } from '@prisma/client';

export type Group = { group: Omit<GroupOrm, 'id' | 'permission'> };

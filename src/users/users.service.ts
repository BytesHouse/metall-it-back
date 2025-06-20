import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { AddressData } from './entities/address.entity';
import { UserData, UserSearch } from './entities/user.entity';
import { hasProperties, removeEmpty } from 'src/utils/utils';
import { FoundUsersDto } from './dto/found-users.dto';
import { UpdatedUserDto } from './dto/updated-user.dto';
import { RemovedUserDto } from './dto/removed-user.dto';
import {
  FoundUserNonPrivateType,
  FoundUserType,
  emptyUser,
} from './users.constants';
import { Role } from 'src/auth/enums/role.enum';
import { hash } from 'bcrypt';
import { UserGroupId } from 'src/auth/enums/usergroup.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly dbService: PrismaService) {}

  async create(createUser: CreateUserDto) {
    this.logger.debug('Creating user...');

    if (await this.checkUserExists(createUser.username, createUser.email)) {
      throw new BadRequestException(
        `${createUser.username} or ${createUser.email} already exist`,
      );
    }

    const groupId = this.getUserGroupIdByRole(createUser.role);
    const userId = uuidv4();
    const createdUser = await this.dbService.user.create({
      data: {
        id: userId,
        companyId: createUser.companyId || 'metal-it',
        hash: createUser.hash,
        username: createUser.username,
        fullName: createUser.fullName || 'NoNa',
        email: createUser.email,
        phone: createUser.phone,
        active: createUser.active,
        notes: createUser.notes,
        address: {
          create: {
            id: uuidv4(),
            state: createUser.state,
            city: createUser.city,
            zip: createUser.zip,
            address1: createUser.address1,
            address2: createUser.address2,
          },
        },
        userGroup: {
          create: {
            groupId,
          },
        },
      },
    });

    return createdUser.id;
  }

  async findAll(companyId?: string) {
    this.logger.debug('Getting all users...');
    const users = await this.dbService.user.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        companyId: true,
        hash: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        active: true,
        notes: true,
        method: true,
        address: {
          select: {
            state: true,
            city: true,
            zip: true,
            address1: true,
            address2: true,
          },
        },
        userGroup: {
          select: { group: { select: { role: true } } },
        },
      },
    });
    return new FoundUsersDto(users);
  }

  async findOne(
    searchClause: UserSearch,
    includeAddress = false,
  ): Promise<FoundUserType> {
    this.logger.debug(`Getting exact ${searchClause.id} user...`);

    try {
      const user = await this.dbService.user.findFirstOrThrow({
        where: {
          ...searchClause,
          username: searchClause.username
            ? { equals: searchClause.username, mode: 'insensitive' }
            : undefined,
        },
        select: {
          id: true,
          companyId: true,
          hash: true,
          fullName: true,
          username: true,
          email: true,
          phone: true,
          active: true,
          notes: true,
          method: true,
          address: includeAddress
            ? {
                select: {
                  state: true,
                  city: true,
                  zip: true,
                  address1: true,
                  address2: true,
                },
              }
            : false,
          userGroup: {
            select: { group: { select: { role: true } } },
          },
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Requested user has not been found');
    }
  }

  async findNonePrivate(
    userId: string | undefined,
    companyId: string | undefined,
  ): Promise<FoundUserNonPrivateType[]> {
    const whereClause = userId ? { id: userId } : { companyId };

    try {
      const user = await this.dbService.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Requested user has not been found');
    }
  }

  async update(
    id: string,
    companyId: string | undefined,
    role: string,
    payloadUserId: string | undefined,
    updateUser: UpdateUserDto,
  ) {
    this.logger.debug(`Updating user by identifier ${id}`);
    const userRole = await this.getUserRole(id);
    await this.checkUserAssignToCompany(companyId, 'id', id);

    let hasUpdates = false;

    const updateAddress = removeEmpty<AddressData>({
      state: updateUser.state,
      city: updateUser.city,
      zip: updateUser.zip,
      address1: updateUser.address1,
      address2: updateUser.address2,
    });
    if (hasProperties(updateAddress)) {
      const { addressId } = await this.dbService.user.findFirstOrThrow({
        where: {
          id: id,
        },
        select: {
          addressId: true,
        },
      });

      await this.dbService.address.update({
        where: {
          id: addressId,
        },
        data: updateAddress,
      });
      hasUpdates = true;
    }
    let passwordHash;
    if (updateUser.password) {
      passwordHash = await hash(updateUser.password, 10);
    }
    const user = removeEmpty<UserData>({
      email: updateUser.email,
      hash: passwordHash,
      fullName: updateUser.fullName,
      phone: updateUser.phone,
      active: updateUser.active,
      notes: updateUser.notes,
    });

    if (hasProperties(user)) {
      if (updateUser.email) {
        const info = await this.dbService.user.findFirst({
          where: { NOT: [{ id: id }], email: updateUser.email },
          select: {
            email: true,
          },
        });
        if (info) {
          throw new BadRequestException(
            'Unable to update the user with existing email',
          );
        }
      }

      await this.dbService.user.update({
        where: {
          id: id,
        },
        data: user as Prisma.UserUncheckedUpdateInput,
      });
      hasUpdates = true;
    }
    if (updateUser.role) {
      const groupId = this.getUserGroupIdByRole(updateUser.role);
      await this.dbService.userGroup.update({
        data: { groupId: groupId },
        where: {
          userId: id,
        },
      });

      hasUpdates = true;
    }

    if (updateUser.role || updateUser.password || !updateUser.active) {
      await this.dbService.token.deleteMany({ where: { id } });
    }

    if (hasUpdates) {
      return new UpdatedUserDto(
        await this.findOne(
          {
            id: id,
          },
          true,
        ),
      );
    } else {
      return new UpdatedUserDto(emptyUser);
    }
  }

  async remove(id: string, companyId: string | undefined, role: string) {
    this.logger.debug(`Removing user with identifier ${id}`);
    if (role !== Role.Admin) {
      const userRole = await this.getUserRole(id);
      if (userRole === Role.Admin) {
        throw new ForbiddenException('Unable to perform the action with user');
      }
    }
    await this.checkUserAssignToCompany(companyId, 'id', id);

    await this.dbService.$transaction(async (tx) => {
      const token = await tx.token.findFirst({ where: { id } });
      if (token) {
        await tx.token.delete({ where: { id } });
      }

      await tx.userGroup.delete({ where: { userId: id } });

      const { addressId } = await tx.user.findFirstOrThrow({
        where: { id },
        select: { addressId: true },
      });
      await tx.user.delete({ where: { id } });
      await tx.address.delete({ where: { id: addressId } });
    });

    return new RemovedUserDto(id);
  }

  async removeByCompany(companyId: string) {
    this.logger.debug(`Deleting users with companyId "${companyId}"...`);

    const users = await this.dbService.user.findMany({
      where: { companyId },
    });
    const userIds = users.map((user) => user.id);
    const addressIds = users.map((user) => user.addressId);

    await this.dbService.$transaction([
      this.dbService.token.deleteMany({ where: { id: { in: userIds } } }),
      this.dbService.userGroup.deleteMany({
        where: { userId: { in: userIds } },
      }),
      this.dbService.user.deleteMany({ where: { companyId } }),
      this.dbService.address.deleteMany({ where: { id: { in: addressIds } } }),
    ]);
  }

  async getUserRole(id: string): Promise<string> {
    const usergroup = await this.dbService.userGroup.findFirstOrThrow({
      where: {
        userId: id,
      },
      include: {
        group: true,
      },
    });

    return usergroup.group.role;
  }

  async getUserToken(userId: string): Promise<string | undefined> {
    try {
      const { token } = await this.dbService.token.findFirstOrThrow({
        where: { id: userId },
        select: { token: true },
      });

      return token;
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  async saveUserToken(id: string, token: string): Promise<void> {
    await this.dbService.token.upsert({
      where: { id: id },
      update: { token },
      create: { id, token },
    });
  }

  private async checkUserExists(
    username: string,
    email: string | null,
  ): Promise<boolean> {
    return (
      null !=
      (await this.dbService.user.findFirst({
        where: {
          OR: [
            {
              username: username,
            },
            email ? { email: email } : {},
          ],
        },
      }))
    );
  }

  private async checkUserAssignToCompany(
    companyId: string | undefined,
    key: keyof UserSearch,
    value: string,
  ) {
    if (!companyId) return;

    const whereClause: UserSearch = {};
    whereClause[key] = value;

    let userInfo: { id: string; companyId: string } | undefined = undefined;
    try {
      userInfo = await this.dbService.user.findFirstOrThrow({
        where: whereClause,
        select: {
          id: true,
          companyId: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Requested user has not been found', {
        cause: error,
      });
    }

    if (userInfo !== undefined && userInfo.companyId !== companyId) {
      throw new ForbiddenException('Unable to perform the action with user');
    }
  }

  private getUserGroupIdByRole(role: string): UserGroupId {
    switch (role) {
      case Role.Admin:
        return UserGroupId.Admin;
      default:
        return UserGroupId.User;
    }
  }
}

export class PrismaError extends Error {
  public errorType: PrismaErrorType;

  constructor(message: string, type: PrismaErrorType) {
    super(message);
    this.errorType = type;
  }
}

type PrismaErrorType = 'record-exists';

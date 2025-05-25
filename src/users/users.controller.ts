import {
  Controller,
  Get,
  Body,
  Headers,
  Patch,
  Param,
  Delete,
  Logger,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearch } from './entities/user.entity';
import { FoundUsersDto } from './dto/found-users.dto';
import { FoundUserDto } from './dto/found-user.dto';
import { UpdatedUserDto } from './dto/updated-user.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import {
  PayloadCompany,
  PayloadUser,
  PayloadRole,
  PayloadUserId,
} from 'src/auth/auth.constants';
import { FoundUsersNonPrivateDto } from './dto/found-users-non-private';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  findAll(
    @PayloadCompany() companyId: string | undefined,
  ): Promise<FoundUsersDto> {
    this.logger.debug(`Getting all users for company "${companyId}"`);
    return this.usersService.findAll(companyId);
  }

  @Get('non-private')
  @Roles(Role.Service, Role.Admin, Role.User)
  async findNonPrivate(
    @PayloadCompany() companyId: string | undefined,
    @Query('id') id?: string,
  ): Promise<FoundUsersNonPrivateDto> {
    const user = await this.usersService.findNonePrivate(id, companyId);
    return new FoundUsersNonPrivateDto(user);
  }

  @Get(':id')
  @Roles(Role.Service, Role.Admin, Role.User)
  async findOne(
    @Param('id') id: string,
    @Headers(PayloadRole) payloadRole: string | undefined,
    @Headers(PayloadUserId) payloadUserId: string | undefined,
    @PayloadCompany() companyId: string | undefined,
  ): Promise<FoundUserDto> {
    if (!payloadRole || (payloadRole === Role.User && payloadUserId !== id)) {
      throw new ForbiddenException(
        `You don't have access to get user details!`,
      );
    }
    const searchClause: UserSearch = { id };
    if (!(payloadUserId === id) && companyId) {
      searchClause.companyId = companyId;
    }
    const user = await this.usersService.findOne(searchClause, true);
    return new FoundUserDto(user);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @PayloadCompany() companyId: string | undefined,
    @Headers(PayloadRole) payloadRole: string,
    @Headers(PayloadUserId) payloadUserId: string | undefined,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdatedUserDto> {
    if (
      updateUserDto.role &&
      payloadRole !== updateUserDto.role &&
      payloadUserId === id
    )
      throw new ForbiddenException(`You don't have access to update the role!`);

    return this.usersService.update(
      id,
      companyId,
      payloadRole,
      payloadUserId,
      updateUserDto,
    );
  }

  @Roles(Role.Admin)
  @Delete()
  async removeByCompany(@Query('companyId') companyId: string) {
    return await this.usersService.removeByCompany(companyId);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(
    @Param('id') id: string,
    @PayloadCompany() companyId: string | undefined,
    @PayloadUser() userId: string | undefined,
    @Headers(PayloadRole) role: string,
  ) {
    if (userId === id) {
      throw new ForbiddenException(`Unable to remove yourself: ${id}`);
    }
    return this.usersService.remove(id, companyId, role);
  }
}

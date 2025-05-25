import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserRequest } from './dto/register-user.request.dto';
import { TokenService } from '../token/token.service';
import { hash, compare } from 'bcrypt';
import { TokenPayload } from 'src/token/entities/token-payload.entity';
import { TokenSignOptions } from 'src/token/entities/token-sign-options.entity';
import { generateUserEmail } from 'src/utils/utils';
import { Role } from './enums/role.enum';
import { AuthConfig, AuthInjectToken } from 'src/config/auth.configuration';
import { NIL as NIL_UUID } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    @AuthInjectToken() private readonly authConfig: AuthConfig,
  ) {}

  async register(
    auth: string,
    companyId: string | undefined,
    user: RegisterUserRequest,
  ): Promise<string> {
    this.logger.debug('Registering the new user');

    const hashedPswd = await hash(user.password, 10);

    const userId = await this.userService.create({
      ...user,
      hash: hashedPswd,
      companyId,
    });
    if (user.email) {
      const companyData = undefined;
      try {
      } catch (error) {
        this.logger.debug(`No company found: ${error}`);
      }
      const fd = new FormData();
      fd.append('to', user.email);
      fd.append(
        'subject',
        `You have been invited by ${companyData?.name || ''} to become a user`,
      );
      fd.append('emailType', 'noreply');
      fd.append(
        'content',
        generateUserEmail(
          `Message text`,
          this.authConfig.emailOrigin || '',
          'Start working',
        ),
      );
      //   To-DO
      // send Email
    }
    return userId;
  }

  async login(
    username: string,
    password: string,
    role: string | undefined,
  ): Promise<string> {
    this.logger.debug(
      `User "${username}" trying to login with password ${password}`,
    );

    const user = await this.userService.findOne({ username: username }, false);
    if (!user?.active) {
      throw new ForbiddenException('Account is not active');
    }
    if (!(user?.hash && (await compare(password, user.hash)))) {
      throw new UnauthorizedException(
        'Password is invalid. Please try again...',
      );
    }

    const userRole = await this.userService.getUserRole(user.id);
    if (!userRole) {
      throw new NotFoundException(
        `User "${username}" is not assigned to any group`,
      );
    }
    if (role && role !== userRole) {
      throw new ForbiddenException(`You don't have access`);
    }
    this.logger.debug(user);
    return await this.updateToken(user.id, user.companyId, userRole);
  }

  async verify(token: string): Promise<TokenPayload> {
    this.logger.debug(`Verification of user token: ${token}`);
    const payload = await this.tokenService.verify(token);

    const existingToken = await this.userService.getUserToken(payload.sub);
    if (existingToken !== token) {
      throw new UnauthorizedException(
        'Token is not match to the user. Please re-login',
      );
    }

    return payload;
  }

  async forgotPassword(email: string, origin: string) {
    this.logger.debug(`Requested forgot password for email: ${email}`);
    if (!email) {
      throw new BadRequestException('Email should not be empty or undefined');
    }
    const user = await this.userService.findOne({ email: email }, false);
    this.logger.debug(user);
    if (!user?.active) {
      throw new ForbiddenException('Account is not active');
    }
    const signOptions: TokenSignOptions = {
      expiresIn: `${this.authConfig.forgotPasswordExpiresIn}m`,
    };
    const token = await this.updateToken(
      user.id,
      user.companyId,
      Role.ForgotPassword,
      signOptions,
    );

    const fd = new FormData();
    fd.append('to', email);
    fd.append('subject', 'Reset Account Password');
    fd.append('emailType', 'noreply');
    fd.append(
      'content',
      generateUserEmail(
        'A request has been received to change the password for your account.',
        `${origin}#${token}`,
        'Reset Password',
      ),
    );
    // To-DO EMail
  }

  async changePassword(
    userId: string,
    oldPassword: string | undefined,
    newPassword: string,
    role: string,
  ) {
    this.logger.debug(
      `User ${userId} trying to change the password with ${role} role`,
    );
    if (role !== Role.ForgotPassword) {
      if (!newPassword) {
        throw new BadRequestException(
          'Password should not be empty or undefined',
        );
      }
      const user = await this.userService.findOne({ id: userId }, false);
      if (!user?.active) {
        throw new ForbiddenException('Account is not active');
      }
      if (
        !(oldPassword && user?.hash && (await compare(oldPassword, user.hash)))
      ) {
        throw new UnauthorizedException(
          'Password is invalid. Please try again...',
        );
      }
    }
    if (!newPassword) {
      throw new BadRequestException(
        'New password should not be empty or undefined',
      );
    }
    await this.userService.update(userId, undefined, role, userId, {
      password: newPassword,
    });
  }

  private async updateToken(
    userId: string,
    companyId: string,
    role: string,
    options: TokenSignOptions | undefined = undefined,
  ) {
    const payload: TokenPayload = { sub: userId, companyId, role };
    this.logger.debug(payload);
    const token = await this.tokenService.sign(payload, options);
    this.logger.debug(token);
    await this.userService.saveUserToken(userId, token);
    return token;
  }
}

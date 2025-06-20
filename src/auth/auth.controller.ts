import {
  Headers,
  InternalServerErrorException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserRequest } from './dto/register-user.request.dto';
import { RegisterUserResponse } from './dto/register-user.response.dto';
import { LoginUserRequest } from './dto/login-user.request.dto';
import { LoginUserResponse } from './dto/login-user.response.dto';
import { VerifyTokenResponse } from './dto/verify-token.response.dto';
import { ForgotPasswordRequest } from './dto/forgot-password.request.dto';
import { ChangePasswordRequest } from './dto/change-password.request.dto';
import { Public } from './decorator/public.decorator';
import { Roles } from './decorator/roles.decorator';
import { Role } from './enums/role.enum';
import { PayloadRole, PayloadUser } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() registerRequest: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    const userId = await this.authService.register(registerRequest);
    if (!userId) {
      throw new InternalServerErrorException(
        {},
        `${registerRequest.username} isn't registered!`,
      );
    }

    return new RegisterUserResponse(userId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginRequest: LoginUserRequest,
  ): Promise<LoginUserResponse> {
    const token = await this.authService.login(
      loginRequest.username,
      loginRequest.password,
    );
    return new LoginUserResponse(token);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('verify')
  async verify(@Query('token') token: string): Promise<VerifyTokenResponse> {
    const data = await this.authService.verify(token);
    return new VerifyTokenResponse(data);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgotPassword')
  forgotPassword(
    @Headers('origin') origin: string,
    @Body() forgotPasswordRequest: ForgotPasswordRequest,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordRequest.email, origin);
  }

  @HttpCode(HttpStatus.OK)
  @Post('changePassword')
  @Roles(Role.Admin, Role.User, Role.ForgotPassword)
  changePassword(
    @PayloadUser() userId: string,
    @Headers(PayloadRole) role: string,
    @Body() changePasswordRequest: ChangePasswordRequest,
  ): Promise<void> {
    return this.authService.changePassword(
      userId,
      changePasswordRequest.oldPassword,
      changePasswordRequest.newPassword,
      role,
    );
  }
}

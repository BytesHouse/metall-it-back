import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { Role } from './enums/role.enum';
import { ROLES_KEY } from './decorator/roles.decorator';
import { PayloadCompanyId, PayloadRole, PayloadUserId } from './auth.constants';
import { NIL as NIL_UUID } from 'uuid';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.getDecoratorValue<boolean>(context, IS_PUBLIC_KEY);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Could not find the authorization token');
    }

    const payload = await this.authService.verify(token);
    if (!payload) {
      throw new UnauthorizedException(
        'Unable to verify token. Please re-login.',
      );
    }

    const supportedRoles = this.getDecoratorValue<Role[]>(context, ROLES_KEY);
    if (supportedRoles && !supportedRoles.some((r) => payload.role === r)) {
      throw new ForbiddenException('Permission denied!');
    }

    if (payload.companyId !== NIL_UUID) {
      request.headers[PayloadCompanyId] = payload.companyId;
    }
    request.headers[PayloadRole] = payload.role;
    request.headers[PayloadUserId] = payload.sub;

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getDecoratorValue<T>(context: ExecutionContext, key: string) {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}

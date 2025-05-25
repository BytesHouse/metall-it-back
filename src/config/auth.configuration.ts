import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

const DEFAULT_FORGOT_PASSWORD_EXPIRES_IN = 15;

export const AuthConfigFactory = registerAs('auth', () => ({
  forgotPasswordExpiresIn: process.env.FORGOT_PASSWORD_EXPIRES_IN
    ? +process.env.FORGOT_PASSWORD_EXPIRES_IN
    : DEFAULT_FORGOT_PASSWORD_EXPIRES_IN,
  emailOrigin: process.env.EMAIL_START_WORKING_HOST,
}));

export const AuthInjectToken = () => Inject(AuthConfigFactory.KEY);
export type AuthConfig = ConfigType<typeof AuthConfigFactory>;

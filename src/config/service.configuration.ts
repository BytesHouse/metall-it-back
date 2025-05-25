import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const ServicesConfigFactory = registerAs('service', () => ({
  token: process.env.JWT_TOKEN || '',
}));

export const ServiceInjectToken = () => Inject(ServicesConfigFactory.KEY);
export type ServiceConfig = ConfigType<typeof ServicesConfigFactory>;

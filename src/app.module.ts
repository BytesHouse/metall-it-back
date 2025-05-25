import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesConfigFactory } from './config/service.configuration';
import { AuthConfigFactory } from './config/auth.configuration';
import { ConfigModule } from '@nestjs/config';
import { MetallModule } from './metall/metall.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AuthConfigFactory, ServicesConfigFactory],
    }),
    AuthModule,
    UsersModule,
    MetallModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

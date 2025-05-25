import { Module } from '@nestjs/common';
import { MetallService } from './metall.service';
import { MetallController } from './metall.controller';

@Module({
  controllers: [MetallController],
  providers: [MetallService],
})
export class MetallModule {}

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MetallService {
  private readonly logger = new Logger(MetallService.name);

  getAll(): string {
    return 'Металлы получены';
  }

  @Cron('0 11 * * *', {
    timeZone: 'Europe/Moscow',
  })
  handleCron() {
    this.logger.debug('Cron запущен в 11 по МСК - тест консоль');
  }
}

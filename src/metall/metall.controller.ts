import { Controller, Get } from '@nestjs/common';
import { MetallService } from './metall.service';

@Controller('metall')
export class MetallController {
  constructor(private readonly metallService: MetallService) {}

  @Get()
  getAll(): string {
    return this.metallService.getAll();
  }
}

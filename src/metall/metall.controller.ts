import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MetallService } from './metall.service';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('metall')
export class MetallController {
  constructor(private readonly metallService: MetallService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  getAll(): string {
    return this.metallService.getAll();
  }
}

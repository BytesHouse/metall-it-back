import { Injectable } from '@nestjs/common';

@Injectable()
export class MetallService {
  getAll(): string {
    return 'Металлы получены';
  }
}

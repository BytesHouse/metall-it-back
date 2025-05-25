import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.CORS_ORIGIN_HOST) {
    const port = process.env.SERVICE_PORT || 3000;
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.CORS_ORIGIN_HOST.split(',').map((host) =>
        host.startsWith('http') ? host : new RegExp(host),
      ),
      methods: ['GET', 'PATCH', 'POST', 'DELETE'],
      maxAge: 600,
    });

    await app.listen(port);
  }
}
bootstrap();

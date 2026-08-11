import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('System Rezerwacji Stolików — API')
    .setDescription(
      'Dokumentacja REST API. Kanoniczny URL w kontenerze: /api/docs/ (z ukośnikiem). ' +
      'Wybierz serwer w dropdownie: "/api" za nginx (prod/kontener), "/" bezpośrednio (dev).'
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addServer('/api', 'Przez nginx (produkcja / kontener)')
    .addServer('/', 'Bezpośredni backend (dev / localhost:3000)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } });

  await app.listen(3000);
}
bootstrap();
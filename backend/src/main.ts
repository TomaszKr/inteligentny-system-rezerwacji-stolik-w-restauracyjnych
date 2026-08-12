import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/**
 * Czy udostępniać Swagger UI. Domyślnie WYŁĄCZONE w produkcji (#77, OWASP A05) —
 * dokumentacja ujawnia powierzchnię API. Włącz jawnie SWAGGER_ENABLED=true.
 */
function isSwaggerEnabled(): boolean {
  if (process.env.SWAGGER_ENABLED !== undefined) {
    return process.env.SWAGGER_ENABLED === 'true';
  }
  return process.env.NODE_ENV !== 'production';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Za reverse proxy (nginx) — ufaj X-Forwarded-For, by rate limiting działał per realne IP klienta
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  // Nagłówki bezpieczeństwa (OWASP A05). CSP wyłączone, by nie blokować Swagger UI;
  // nagłówki dla SPA ustawia dodatkowo nginx.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  if (isSwaggerEnabled()) {
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
  }

  // Ostrzeżenie: ekspozycja tokenu weryfikacyjnego w produkcji omija sens weryfikacji e-mail (#81)
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.EMAIL_VERIFICATION_EXPOSE_TOKEN ?? 'true') === 'true'
  ) {
    new Logger('Bootstrap').warn(
      'EMAIL_VERIFICATION_EXPOSE_TOKEN=true w produkcji — token weryfikacyjny jest zwracany w odpowiedzi rejestracji. Ustaw false.',
    );
  }

  await app.listen(3000);
}
bootstrap();

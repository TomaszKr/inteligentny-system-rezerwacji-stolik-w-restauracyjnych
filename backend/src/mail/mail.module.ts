import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { MailService } from './mail.service';
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.MAIL_PORT, 10) || 2525,
        secure: false,
        // Auth tylko gdy podano poświadczenia. Bez tego nodemailer próbuje
        // PLAIN z pustymi danymi → EAUTH. Serwery bez auth (np. mailpit) wtedy
        // działają. (#mail-local-dev)
        auth: process.env.MAIL_USER
          ? {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            }
          : undefined,
      },
      defaults: {
        from: process.env.MAIL_FROM || 'noreply@restaurant-app.com',
      },
      template: {
        dir: path.join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forFeature([Reservation]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

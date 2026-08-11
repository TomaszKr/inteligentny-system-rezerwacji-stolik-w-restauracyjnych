import { IsString, IsOptional, IsInt, IsNotEmpty, IsEmail } from 'class-validator';

export class MailOptionsDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  context?: Record<string, any>;
}

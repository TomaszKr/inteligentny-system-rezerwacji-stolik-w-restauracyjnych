import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class MailOptionsDto {
  @IsString()
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

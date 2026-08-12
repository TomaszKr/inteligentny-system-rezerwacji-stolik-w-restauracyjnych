import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorCodeDto {
  @ApiProperty({ example: '123456', description: 'Kod TOTP z aplikacji uwierzytelniającej' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

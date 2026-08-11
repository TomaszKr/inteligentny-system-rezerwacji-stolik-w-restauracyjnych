import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jan.kowalski@example.com', description: 'Adres e-mail użytkownika' })
  email: string;

  @ApiProperty({ example: 'haslo1234', minLength: 8, description: 'Hasło (min. 8 znaków)' })
  password: string;
}

import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'jan.kowalski@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'haslo1234',
    minLength: 8,
    maxLength: 72,
    description: 'Min. 8 znaków; musi zawierać co najmniej jedną literę i jedną cyfrę',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę',
  })
  password: string;

  @ApiProperty({ example: 'Jan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Kowalski' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '+48123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;
}

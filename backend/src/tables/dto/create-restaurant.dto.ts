import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Restauracja Pod Lipą', maxLength: 255, description: 'Nazwa restauracji' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'ul. Kwiatowa 12, 00-001 Warszawa', maxLength: 255, description: 'Adres restauracji' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({ example: '+48 123 456 789', maxLength: 100, description: 'Numer telefonu' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phone: string;

  @ApiProperty({ example: 'kontakt@podlipa.pl', maxLength: 255, description: 'Adres email' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}

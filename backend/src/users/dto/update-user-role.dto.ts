import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.MANAGER,
    description: 'Nowa rola użytkownika',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

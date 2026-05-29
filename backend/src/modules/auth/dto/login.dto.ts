import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@foodapp.local' })
  @ValidateIf((o: LoginDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+998900000001' })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @MinLength(9)
  phone?: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;
}

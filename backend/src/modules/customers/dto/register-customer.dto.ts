import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiProperty({ example: 'Elyor Karimov' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

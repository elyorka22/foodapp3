import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginCustomerDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiPropertyOptional({ description: 'Required when the account has a password set' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

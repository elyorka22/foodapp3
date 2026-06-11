import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class DeleteAccountRequestDto {
  @ApiProperty({ example: '+998901234567', description: 'Account phone number' })
  @IsString()
  @MinLength(9)
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'I no longer use the app' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}

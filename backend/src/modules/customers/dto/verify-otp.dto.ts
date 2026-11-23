import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  code: string;

  @ApiPropertyOptional({ example: 'Ali Valiyev' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;
}

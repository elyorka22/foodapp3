import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SetupOwnerAccountDto {
  @ApiProperty({ description: 'Owner login — phone or email for business panel' })
  @IsString()
  @MinLength(3)
  login: string;

  @ApiProperty({ description: 'Owner password for business panel login' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;
}

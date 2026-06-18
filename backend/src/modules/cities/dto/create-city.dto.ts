import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Chust' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'chust' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Default city for new customers' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

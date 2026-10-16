import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdminRestaurantsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['restaurant', 'store'] })
  @IsOptional()
  @IsIn(['restaurant', 'store'])
  vertical?: 'restaurant' | 'store';

  @ApiPropertyOptional({ description: 'Filter by city slug' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by city UUID' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

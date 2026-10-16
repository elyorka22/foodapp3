import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PublicRestaurantsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by city slug' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by city UUID' })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class BusinessesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by business type slug (restaurant, grocery, ...)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Search business or product name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['popular', 'nearest', 'rating', 'fastest'] })
  @IsOptional()
  @IsIn(['popular', 'nearest', 'rating', 'fastest'])
  sort?: 'popular' | 'nearest' | 'rating' | 'fastest';

  @ApiPropertyOptional({ description: 'Exclude businesses of this type slug' })
  @IsOptional()
  @IsString()
  excludeType?: string;

  @ApiPropertyOptional({ enum: ['restaurant', 'store'], description: 'Merchant vertical' })
  @IsOptional()
  @IsIn(['restaurant', 'store'])
  vertical?: 'restaurant' | 'store';
}

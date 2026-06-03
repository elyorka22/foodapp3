import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdminRestaurantsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['restaurant', 'store'] })
  @IsOptional()
  @IsIn(['restaurant', 'store'])
  vertical?: 'restaurant' | 'store';
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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class EnrollCatalogDto {
  @ApiProperty({ description: 'Store UUID to enroll into its type shared catalog' })
  @IsUUID()
  businessId: string;

  @ApiPropertyOptional({ deprecated: true, description: 'Legacy alias for businessId' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class DeliveryQuoteDto {
  @ApiProperty({ description: 'Restaurant / store business UUID' })
  @IsUUID()
  restaurantId: string;

  @ApiPropertyOptional({ description: 'Specific branch UUID (defaults to first active)' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: 41.02 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 71.28 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

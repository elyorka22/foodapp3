import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 1, maximum: 99 })
  @IsNumber()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class CreateGuestOrderDto {
  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: 'Optional text address; GPS coords are required' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @ApiProperty({ example: 41.311081 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 69.240562 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @ApiPropertyOptional({ description: 'Must match registered phone on file' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Promo code to apply' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  promoCode?: string;

  @ApiPropertyOptional({ description: 'Mobile install id for order push notifications' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

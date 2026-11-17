import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  PRODUCT_SALE_UNITS,
  type ProductSaleUnitValue,
} from './create-product.dto';

/** Admin: shared catalog product for a business type (SHARED_CATALOG). */
export class CreateSharedProductDto {
  @ApiPropertyOptional({ description: 'Business type UUID' })
  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @ApiPropertyOptional({ description: 'Business type slug (grocery, perfume, …)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Suggested price copied into new store offers on enroll',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPrice?: number;

  @ApiPropertyOptional({
    description: 'Catalog list price / default when defaultPrice omitted',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({
    enum: PRODUCT_SALE_UNITS,
    description: 'Sale unit: dona / gr / kg / karobka',
    default: 'dona',
  })
  @IsOptional()
  @IsIn(PRODUCT_SALE_UNITS)
  saleUnit?: ProductSaleUnitValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'false = hide shared SKU from this store menu' })
  @IsOptional()
  @IsBoolean()
  isListed?: boolean;
}

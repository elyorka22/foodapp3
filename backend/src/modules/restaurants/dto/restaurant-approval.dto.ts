import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestaurantApprovalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RestaurantApprovalDto {
  @ApiProperty({ enum: RestaurantApprovalStatus })
  @IsEnum(RestaurantApprovalStatus)
  status: RestaurantApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

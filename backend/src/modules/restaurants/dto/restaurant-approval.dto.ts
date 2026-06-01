import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessApprovalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RestaurantApprovalDto {
  @ApiProperty({ enum: BusinessApprovalStatus })
  @IsEnum(BusinessApprovalStatus)
  status: BusinessApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

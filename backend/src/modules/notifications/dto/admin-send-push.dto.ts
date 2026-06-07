import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { NotificationAccountType, UserRole } from '@prisma/client';

export enum PushBroadcastAudience {
  CUSTOMERS = 'CUSTOMERS',
  COURIERS = 'COURIERS',
  STAFF = 'STAFF',
  ALL = 'ALL',
  USER = 'USER',
}

export class AdminSendPushDto {
  @ApiProperty({ enum: PushBroadcastAudience })
  @IsEnum(PushBroadcastAudience)
  audience: PushBroadcastAudience;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  body: string;

  @ApiPropertyOptional({ enum: ['SYSTEM', 'PROMOTION'] })
  @IsOptional()
  @IsIn(['SYSTEM', 'PROMOTION'])
  templateCode?: 'SYSTEM' | 'PROMOTION';

  @ApiPropertyOptional({ description: 'Required when audience is USER' })
  @ValidateIf((dto) => dto.audience === PushBroadcastAudience.USER)
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: NotificationAccountType })
  @ValidateIf((dto) => dto.audience === PushBroadcastAudience.USER)
  @IsEnum(NotificationAccountType)
  accountType?: NotificationAccountType;

  @ApiPropertyOptional({ enum: UserRole, description: 'Required for STAFF USER targets (e.g. COURIER)' })
  @ValidateIf(
    (dto) =>
      dto.audience === PushBroadcastAudience.USER &&
      dto.accountType === NotificationAccountType.STAFF,
  )
  @IsEnum(UserRole)
  userRole?: UserRole;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { TelegramSignedPayload } from '../types/telegram-auth.types';

/**
 * HTTP body for `POST /auth/telegram`.
 * Same JSON contract for Web Login Widget, Flutter (`telegram_login`), and other Telegram SDKs.
 */
export class TelegramAuthDto implements TelegramSignedPayload {
  @ApiProperty({ description: 'Telegram user id' })
  @Type(() => Number)
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  first_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty({ description: 'Unix timestamp when Telegram signed this payload' })
  @Type(() => Number)
  @IsInt()
  auth_date: number;

  @ApiProperty({ description: 'HMAC-SHA256 signature — verified server-side with TELEGRAM_BOT_TOKEN' })
  @IsString()
  @MinLength(32)
  hash: string;
}

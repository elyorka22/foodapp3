import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TelegramChatDto {
  @IsNumber()
  id!: number;
}

class TelegramUserDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  username?: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;
}

class TelegramMessageDto {
  @IsNumber()
  message_id!: number;

  @ValidateNested()
  @Type(() => TelegramChatDto)
  chat!: TelegramChatDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  from?: TelegramUserDto;

  @IsOptional()
  text?: string;
}

class TelegramCallbackQueryDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  from?: TelegramUserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  message?: TelegramMessageDto;
}

export class TelegramWebhookUpdateDto {
  @IsOptional()
  @IsNumber()
  update_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  message?: TelegramMessageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramCallbackQueryDto)
  callback_query?: TelegramCallbackQueryDto;
}

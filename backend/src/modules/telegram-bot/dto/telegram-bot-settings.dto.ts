import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class TelegramBotSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  welcomeMessage?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'siteUrl must be a valid URL with http(s)://' })
  @MaxLength(500)
  siteUrl?: string;
}

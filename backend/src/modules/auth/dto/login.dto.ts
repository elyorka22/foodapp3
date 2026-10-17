import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { STAFF_LOGIN_CLIENTS } from '../staff-login-client.policy';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@foodapp.local' })
  @ValidateIf((o: LoginDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+998900000001' })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @MinLength(9)
  phone?: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Optional staff app identifier. When omitted, legacy login behavior is preserved.
   * Allowed values: control | business | web_admin.
   * Customer / Google auth must not use this field.
   */
  @ApiPropertyOptional({
    enum: STAFF_LOGIN_CLIENTS,
    example: 'control',
    description:
      'Optional staff client. When set, role must match the client allowlist.',
  })
  @Transform(({ value }) => {
    if (value == null) return undefined;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  @IsIn([...STAFF_LOGIN_CLIENTS], {
    message: `client must be one of: ${STAFF_LOGIN_CLIENTS.join(', ')}`,
  })
  client?: (typeof STAFF_LOGIN_CLIENTS)[number];
}

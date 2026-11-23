import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MinLength(9)
  phone: string;
}

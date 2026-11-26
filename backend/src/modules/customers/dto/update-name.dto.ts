import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateNameDto {
  @ApiProperty({ example: 'Ali Valiyev' })
  @IsString()
  @MinLength(2)
  fullName: string;
}

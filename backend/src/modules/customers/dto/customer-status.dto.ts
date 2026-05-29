import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CustomerStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

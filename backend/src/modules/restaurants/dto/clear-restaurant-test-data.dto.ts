import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ClearRestaurantTestDataDto {
  @ApiProperty({ type: [String], description: 'Restaurant (business) UUIDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  businessIds: string[];
}

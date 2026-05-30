import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug: string;
}

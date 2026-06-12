import { PartialType } from '@nestjs/swagger';
import { CreateBookingSlideDto } from './create-booking-slide.dto';

export class UpdateBookingSlideDto extends PartialType(CreateBookingSlideDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateBookingVenueDto } from './create-booking-venue.dto';

export class UpdateBookingVenueDto extends PartialType(CreateBookingVenueDto) {}

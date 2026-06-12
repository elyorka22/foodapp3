import { Module } from '@nestjs/common';
import { BookingVenuesController } from './booking-venues.controller';
import { BookingVenuesService } from './booking-venues.service';

@Module({
  controllers: [BookingVenuesController],
  providers: [BookingVenuesService],
  exports: [BookingVenuesService],
})
export class BookingVenuesModule {}

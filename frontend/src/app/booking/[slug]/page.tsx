'use client';

import { useParams } from 'next/navigation';
import { BookingVenueDetail } from '@/components/booking/booking-landing';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingVenue } from '@/hooks/use-booking-data';
import { uz } from '@/lib/uz';

export default function BookingVenuePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const venue = useBookingVenue(slug);

  if (venue.isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Skeleton className="aspect-[4/3] w-full rounded-none shadow-none" />
        <div className="p-4">
          <Skeleton className="h-8 w-2/3 rounded-lg shadow-none" />
          <Skeleton className="mt-4 h-24 w-full rounded-2xl shadow-none" />
        </div>
      </div>
    );
  }

  if (!venue.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] p-6 text-center text-zinc-500">
        {uz.bookingVenueNotFound}
      </div>
    );
  }

  return <BookingVenueDetail venue={venue.data} />;
}

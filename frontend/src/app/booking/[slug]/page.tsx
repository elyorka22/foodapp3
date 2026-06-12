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
      <div className="min-h-screen bg-[#0c0a09]">
        <Skeleton className="aspect-[4/3] w-full rounded-none bg-zinc-800" />
        <div className="p-4">
          <Skeleton className="h-8 w-2/3 rounded-lg bg-zinc-800" />
          <Skeleton className="mt-4 h-24 w-full rounded-2xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!venue.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0a09] p-6 text-center text-zinc-400">
        {uz.bookingVenueNotFound}
      </div>
    );
  }

  return <BookingVenueDetail venue={venue.data} />;
}

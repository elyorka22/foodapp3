'use client';

import { BookingLanding } from '@/components/booking/booking-landing';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingSlides, useBookingVenues } from '@/hooks/use-booking-data';

export default function BookingPage() {
  const venues = useBookingVenues();
  const slides = useBookingSlides();

  if (venues.isLoading || slides.isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4">
        <Skeleton className="mb-4 h-10 w-32 rounded-full shadow-none" />
        <Skeleton className="mb-6 h-24 w-full rounded-2xl shadow-none" />
        <Skeleton className="mb-8 aspect-[16/10] w-full rounded-2xl shadow-none" />
        <Skeleton className="h-40 w-full rounded-2xl shadow-none" />
      </div>
    );
  }

  return (
    <BookingLanding
      slides={slides.data ?? []}
      venues={venues.data ?? []}
    />
  );
}

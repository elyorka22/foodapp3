'use client';

import { BookingLanding } from '@/components/booking/booking-landing';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingSlides, useBookingVenues } from '@/hooks/use-booking-data';

export default function BookingPage() {
  const venues = useBookingVenues();
  const slides = useBookingSlides();

  if (venues.isLoading || slides.isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0a09] p-4">
        <Skeleton className="mb-4 h-10 w-32 rounded-full bg-zinc-800" />
        <Skeleton className="mb-6 h-24 w-full rounded-2xl bg-zinc-800" />
        <Skeleton className="mb-8 aspect-[16/10] w-full rounded-3xl bg-zinc-800" />
        <Skeleton className="h-40 w-full rounded-3xl bg-zinc-800" />
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

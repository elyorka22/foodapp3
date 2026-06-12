'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type BookingVenueType = 'TABLE' | 'HALL' | 'BOTH';

export type BookingVenue = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  coverScale?: number;
  coverPositionX?: number;
  coverPositionY?: number;
  venueType: BookingVenueType;
  highlights: string[];
};

export type BookingSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  venue?: { id: string; name: string; slug: string } | null;
};

export function useBookingVenues() {
  return useQuery({
    queryKey: ['booking', 'venues'],
    queryFn: () => api<BookingVenue[]>('/booking/venues'),
    staleTime: 60_000,
  });
}

export function useBookingVenue(slug: string) {
  return useQuery({
    queryKey: ['booking', 'venue', slug],
    queryFn: () => api<BookingVenue>(`/booking/venues/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useBookingSlides() {
  return useQuery({
    queryKey: ['booking', 'slides'],
    queryFn: () => api<BookingSlide[]>('/booking/slides'),
    staleTime: 60_000,
  });
}

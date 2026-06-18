'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarHeart, MapPin, PartyPopper, Phone, Sparkles, Utensils } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { uz } from '@/lib/uz';
import type { BookingSlide, BookingVenue } from '@/hooks/use-booking-data';

type Props = {
  slides: BookingSlide[];
  venues: BookingVenue[];
};

function venueTypeLabel(type: BookingVenue['venueType']) {
  if (type === 'TABLE') return uz.bookingTypeTable;
  if (type === 'HALL') return uz.bookingTypeHall;
  return uz.bookingTypeBoth;
}

function VenueCard({ venue }: { venue: BookingVenue }) {
  const cover = resolveImageUrl(venue.coverUrl ?? venue.logoUrl);
  const href = `/booking/${encodeURIComponent(venue.slug)}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {cover ? (
          <Image
            src={cover}
            alt={venue.name}
            fill
            className="h-full w-full transition duration-500 group-hover:scale-105"
            style={categoryImageStyle({
              imageScale: venue.coverScale,
              imagePositionX: venue.coverPositionX,
              imagePositionY: venue.coverPositionY,
            })}
            sizes="(max-width: 430px) 100vw, 400px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-orange-200">
            <Sparkles className="text-brand-500" size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600 shadow-sm">
          {venueTypeLabel(venue.venueType)}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-bold text-zinc-900">{venue.name}</h3>
        {venue.description ? (
          <p className="line-clamp-2 text-sm text-zinc-500">{venue.description}</p>
        ) : null}
        {venue.highlights?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {venue.highlights.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {venue.address ? (
          <p className="flex items-start gap-1.5 text-xs text-zinc-500">
            <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />
            <span className="line-clamp-2">{venue.address}</span>
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function BookingLanding({ slides, venues }: Props) {
  const withImages = slides.filter((s) => resolveImageUrl(s.imageUrl));
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    if (withImages.length <= 1) return;
    setIndex((i) => (i + 1) % withImages.length);
  }, [withImages.length]);

  useEffect(() => {
    if (withImages.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, withImages.length]);

  const slide = withImages[index];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-card transition active:scale-95"
        >
          <ArrowLeft size={16} />
          {uz.back}
        </Link>

        <header className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
            <CalendarHeart size={14} />
            {uz.bookingBadge}
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">{uz.bookingTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{uz.bookingSubtitle}</p>
        </header>

        {slide ? (
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={resolveImageUrl(slide.imageUrl)!}
                alt={slide.title || uz.bookingTitle}
                fill
                className="h-full w-full object-cover"
                style={categoryImageStyle(slide)}
                sizes="100vw"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {slide.title ? (
                  <p className="text-xl font-bold text-white">{slide.title}</p>
                ) : null}
                {slide.subtitle ? (
                  <p className="mt-1 text-sm text-white/90">{slide.subtitle}</p>
                ) : null}
                {slide.venue?.slug ? (
                  <Link
                    href={`/booking/${encodeURIComponent(slide.venue.slug)}`}
                    className="mt-3 inline-flex rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {uz.bookingViewVenue}
                  </Link>
                ) : null}
              </div>
            </div>
            {withImages.length > 1 ? (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {withImages.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={uz.slide(i + 1)}
                    className={clsx(
                      'h-1.5 rounded-full transition-all',
                      i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-white/60',
                    )}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <Utensils className="text-brand-500" size={22} />
            <p className="mt-2 text-sm font-semibold text-zinc-900">{uz.bookingFeatureTables}</p>
            <p className="mt-1 text-xs text-zinc-500">{uz.bookingFeatureTablesHint}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <PartyPopper className="text-brand-500" size={22} />
            <p className="mt-2 text-sm font-semibold text-zinc-900">{uz.bookingFeatureHalls}</p>
            <p className="mt-1 text-xs text-zinc-500">{uz.bookingFeatureHallsHint}</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-zinc-900">{uz.bookingVenuesTitle}</h2>
        {venues.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            {uz.bookingEmpty}
          </p>
        ) : (
          <div className="grid gap-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingVenueDetail({ venue }: { venue: BookingVenue }) {
  const cover = resolveImageUrl(venue.coverUrl ?? venue.logoUrl);
  const tel = venue.phone?.replace(/\s/g, '');

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900">
      <div className="relative mx-auto max-w-lg pb-12">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
          {cover ? (
            <Image
              src={cover}
              alt={venue.name}
              fill
              className="object-cover"
              style={categoryImageStyle({
                imageScale: venue.coverScale,
                imagePositionX: venue.coverPositionX,
                imagePositionY: venue.coverPositionY,
              })}
              sizes="100vw"
              priority
              unoptimized
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-brand-100 to-orange-200" />
          )}
          <Link
            href="/booking"
            className="absolute left-4 top-[calc(env(safe-area-inset-top,0px)+12px)] inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-zinc-700 shadow-card"
          >
            <ArrowLeft size={16} />
            {uz.back}
          </Link>
        </div>

        <div className="px-4 pt-4">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase text-brand-600">
            {venueTypeLabel(venue.venueType)}
          </span>
          <h1 className="mt-3 text-[26px] font-bold text-zinc-900">{venue.name}</h1>
          {venue.description ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{venue.description}</p>
          ) : null}

          {venue.highlights?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.highlights.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-card">
            {venue.address ? (
              <p className="flex gap-2 text-sm text-zinc-600">
                <MapPin size={18} className="shrink-0 text-brand-500" />
                {venue.address}
              </p>
            ) : null}
            {tel ? (
              <a
                href={`tel:${tel}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-base font-bold text-white active:scale-[0.98]"
              >
                <Phone size={18} />
                {uz.bookingCallToReserve}
              </a>
            ) : (
              <p className="text-center text-sm text-zinc-500">{uz.bookingNoPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { HomeCenterHeader } from '@/components/home/home-center-header';
import { uz } from '@/lib/uz';

/**
 * Top “stage” for home: brand atmosphere under the city header,
 * with the main content sheet overlapping below (see page.tsx).
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-[calc(env(safe-area-inset-top,0px)+4px)]">
      {/* Brand atmosphere */}
      <div
        className="absolute inset-0 bg-[linear-gradient(155deg,#2A0680_0%,#4A05CA_42%,#7B3AFF_78%,#C4B5FD_100%)]"
        aria-hidden
      />
      {/* Food texture layer */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-luminosity"
        style={{
          backgroundImage: "url('/assets/home-services/restaurants.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 bottom-2 h-36 w-36 opacity-[0.18]"
        style={{
          backgroundImage: "url('/brand-wing.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(0) invert(1)',
        }}
        aria-hidden
      />

      <div className="relative z-10 px-4">
        <HomeCenterHeader tone="hero" />
        <p className="animate-fade-in mt-3 max-w-[16rem] text-[14px] font-medium leading-snug text-white/85">
          {uz.citySubtitle}
        </p>
      </div>
    </section>
  );
}

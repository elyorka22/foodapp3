import Link from 'next/link';

const linkClass =
  'text-sm font-medium text-zinc-600 underline-offset-2 transition hover:text-[#FF6B00] hover:underline';

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-zinc-900">FoodApp</p>
        <p className="text-xs text-zinc-500">Chust — tez va qulay yetkazib berish</p>
        <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Legal">
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
        </nav>
        <a href="mailto:support@foodapp.uz" className="text-xs text-zinc-500 hover:text-[#FF6B00]">
          support@foodapp.uz
        </a>
      </div>
    </footer>
  );
}

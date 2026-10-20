import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeader({ title, subtitle, href, linkLabel = 'See all' }: Props) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-zinc-100 px-2.5 py-1 text-sm font-semibold text-zinc-700 transition active:opacity-70"
        >
          {linkLabel}
          <ChevronRight size={16} strokeWidth={2.25} />
        </Link>
      )}
    </div>
  );
}

'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { colors, shadows } from '@/lib/design-tokens';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Extra class on scrollable body */
  bodyClassName?: string;
};

const MODAL_OPEN_CLASS = 'auth-modal-open';

/**
 * Full-viewport auth sheet above bottom nav (z-[100]).
 * Scrollable body: max 90vh, safe-area padding, flex column layout.
 */
export function AuthBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  bodyClassName,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add(MODAL_OPEN_CLASS);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove(MODAL_OPEN_CLASS);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      role="presentation"
      aria-hidden={false}
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-sheet-title"
        className={clsx(
          'relative z-10 mx-auto flex w-full max-w-lg flex-col rounded-t-2xl bg-white',
          'max-h-[90vh]',
        )}
        style={{ boxShadow: shadows.sheet }}
      >
        <div className="shrink-0 rounded-t-2xl border-b border-border bg-white px-5 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#D1D5DB]" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <h2 id="auth-sheet-title" className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-sm leading-6 text-foreground-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              aria-label={uz.close}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          className={clsx(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3',
            'pb-[calc(env(safe-area-inset-bottom,0px)+20px)]',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

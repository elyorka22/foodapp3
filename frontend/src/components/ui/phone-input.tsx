'use client';

import { clsx } from 'clsx';
import {
  extractUzLocalDigits,
  formatUzLocalDigits,
  toUzPhone,
  UZ_PHONE_PREFIX,
} from '@/lib/phone';
import { uz } from '@/lib/uz';

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'checkout';
};

export function PhoneInput({
  value,
  onChange,
  variant = 'default',
  className,
  id,
  required,
  disabled,
  autoComplete = 'tel-national',
  ...rest
}: Props) {
  const localDigits = extractUzLocalDigits(value);
  const display = formatUzLocalDigits(localDigits);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toUzPhone(e.target.value));
  };

  const isCheckout = variant === 'checkout';

  return (
    <div
      className={clsx(
        'flex w-full items-center overflow-hidden',
        isCheckout
          ? 'h-14 rounded-2xl bg-[#FAF7F2] ring-1 ring-zinc-100 focus-within:ring-2 focus-within:ring-[#FF7A00]/30'
          : 'min-h-[52px] rounded-2xl border border-zinc-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-white/20 dark:bg-zinc-900',
        disabled && 'opacity-60',
        className,
      )}
    >
      <span
        className={clsx(
          'shrink-0 select-none pl-4 text-base font-semibold text-zinc-900 dark:text-zinc-50',
          isCheckout && 'text-[17px]',
        )}
        aria-hidden
      >
        {UZ_PHONE_PREFIX}
      </span>
      <input
        {...rest}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        value={display}
        onChange={handleChange}
        placeholder={uz.phoneHint}
        maxLength={12}
        className={clsx(
          'min-w-0 flex-1 border-0 bg-transparent py-3 pr-4 text-base text-foreground caret-foreground outline-none placeholder:text-foreground-muted',
          isCheckout && 'text-[17px] font-semibold placeholder:font-normal placeholder:text-zinc-400',
        )}
      />
    </div>
  );
}

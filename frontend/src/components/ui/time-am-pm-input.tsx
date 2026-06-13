'use client';

import { formatTime12h, inputValueToTime24, time24ToInputValue } from '@/lib/time-format';

type Props = {
  value: string;
  onChange: (value24: string) => void;
  disabled?: boolean;
  className?: string;
};

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ['00', '15', '30', '45'];

export function TimeAmPmInput({ value, onChange, disabled, className }: Props) {
  const { hour, minute, period } = time24ToInputValue(value);

  const update = (nextHour: number, nextMinute: number, nextPeriod: 'AM' | 'PM') => {
    onChange(inputValueToTime24(nextHour, nextMinute, nextPeriod));
  };

  const selectClass =
    'rounded-xl border border-border bg-surface px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900';

  return (
    <div className={className ?? 'flex flex-wrap items-center gap-1'}>
      <select
        className={selectClass}
        disabled={disabled}
        value={hour}
        onChange={(e) => update(parseInt(e.target.value, 10), minute, period)}
        aria-label="Hour"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        className={selectClass}
        disabled={disabled}
        value={String(minute).padStart(2, '0')}
        onChange={(e) => update(hour, parseInt(e.target.value, 10), period)}
        aria-label="Minute"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        disabled={disabled}
        value={period}
        onChange={(e) => update(hour, minute, e.target.value as 'AM' | 'PM')}
        aria-label="AM or PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
      <span className="text-xs text-zinc-500">{formatTime12h(value)}</span>
    </div>
  );
}

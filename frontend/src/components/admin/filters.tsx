'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (v: { from: string; to: string }) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        type="date"
        value={from}
        onChange={(e) => onChange({ from: e.target.value, to })}
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => onChange({ from, to: e.target.value })}
      />
    </div>
  );
}


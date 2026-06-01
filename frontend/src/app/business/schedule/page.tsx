'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/admin/ui';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type WorkingHour = {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Holiday = { id: string; date: string; reason?: string | null };

export default function BusinessSchedulePage() {
  const { ready, authorized, token } = useRequireStaffRole({
    roles: 'BUSINESS',
  });
  const qc = useQueryClient();

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurantId = restaurants?.data?.[0]?.id;
  const restaurantName = restaurants?.data?.[0]?.name ?? 'Business';

  const { data: hours, isLoading: hoursLoading } = useQuery({
    queryKey: ['working-hours', restaurantId],
    queryFn: () => api<WorkingHour[]>(`/restaurants/${restaurantId}/working-hours`, { token: token ?? undefined }),
    enabled: !!restaurantId && !!token,
  });

  const { data: holidays } = useQuery({
    queryKey: ['holidays', restaurantId],
    queryFn: () => api<Holiday[]>(`/restaurants/${restaurantId}/holidays`, { token: token ?? undefined }),
    enabled: !!restaurantId && !!token,
  });

  const [schedule, setSchedule] = useState<WorkingHour[]>([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  useEffect(() => {
    if (hours?.length) {
      setSchedule(hours);
    } else if (restaurantId && !hoursLoading) {
      setSchedule(
        DAY_NAMES.map((_, dayOfWeek) => ({
          dayOfWeek,
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false,
        })),
      );
    }
  }, [hours, hoursLoading, restaurantId]);

  const saveHours = useMutation({
    mutationFn: () =>
      api(`/restaurants/${restaurantId}/working-hours`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ hours: schedule }),
      }),
    onSuccess: () => {
      toast.success('Working hours saved');
      qc.invalidateQueries({ queryKey: ['working-hours', restaurantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addHoliday = useMutation({
    mutationFn: () =>
      api(`/restaurants/${restaurantId}/holidays`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ date: holidayDate, reason: holidayReason || undefined }),
      }),
    onSuccess: () => {
      toast.success('Holiday added');
      setHolidayDate('');
      setHolidayReason('');
      qc.invalidateQueries({ queryKey: ['holidays', restaurantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeHoliday = useMutation({
    mutationFn: (holidayId: string) =>
      api(`/restaurants/${restaurantId}/holidays/${holidayId}`, {
        method: 'DELETE',
        token: token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holidays', restaurantId] }),
  });

  const nav = [
    { href: '/business/dashboard', label: 'Dashboard' },
    { href: '/business', label: 'Orders' },
    { href: '/business/schedule', label: 'Hours & holidays' },
  ];

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
        Loading...
      </main>
    );
  }

  if (!authorized) return null;

  if (!restaurantId) {
    return (
      <DashboardShell title="Business" nav={nav}>
        <p className="text-sm opacity-70">No restaurant linked to your account.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={restaurantName} nav={nav}>
      {hoursLoading ? (
        <LoadingState label="Loading schedule..." />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-semibold">Working hours</h2>
            <p className="mb-4 text-sm opacity-70">
              Customers cannot order outside these hours. Leave a day closed if needed.
            </p>
            <ul className="space-y-3">
              {schedule.map((row, idx) => (
                <li
                  key={row.dayOfWeek}
                  className="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm dark:border-white/10"
                >
                  <span className="w-24 font-medium">{DAY_NAMES[row.dayOfWeek]}</span>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={(e) => {
                        const next = [...schedule];
                        next[idx] = { ...row, isClosed: e.target.checked };
                        setSchedule(next);
                      }}
                    />
                    Closed
                  </label>
                  <Input
                    type="time"
                    className="w-32"
                    value={row.openTime}
                    disabled={row.isClosed}
                    onChange={(e) => {
                      const next = [...schedule];
                      next[idx] = { ...row, openTime: e.target.value };
                      setSchedule(next);
                    }}
                  />
                  <span>–</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={row.closeTime}
                    disabled={row.isClosed}
                    onChange={(e) => {
                      const next = [...schedule];
                      next[idx] = { ...row, closeTime: e.target.value };
                      setSchedule(next);
                    }}
                  />
                </li>
              ))}
            </ul>
            <Button className="mt-4" onClick={() => saveHours.mutate()} disabled={saveHours.isPending}>
              Save hours
            </Button>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Holidays</h2>
            <div className="flex flex-wrap gap-2">
              <Input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
              <Input
                placeholder="Reason (optional)"
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
              />
              <Button
                onClick={() => addHoliday.mutate()}
                disabled={!holidayDate || addHoliday.isPending}
              >
                Add closure
              </Button>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {(holidays ?? []).map((h) => (
                <li key={h.id} className="flex justify-between rounded-lg border px-3 py-2 dark:border-white/10">
                  <span>
                    {h.date.slice(0, 10)}
                    {h.reason ? ` — ${h.reason}` : ''}
                  </span>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => removeHoliday.mutate(h.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}

'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { adminI18n as t } from '@/lib/admin-i18n';

type Props = {
  login?: string | null;
  password?: string | null;
  fullName?: string | null;
  showPassword?: boolean;
  compact?: boolean;
};

function copyValue(label: string, value: string) {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} ${t.merchant.copied}`);
}

export function MerchantOwnerCredentials({
  login,
  password,
  fullName,
  showPassword = false,
  compact = false,
}: Props) {
  if (!login && !password && !fullName) {
    return <span className="text-xs text-zinc-400">{t.merchant.noOwnerAccount}</span>;
  }

  if (compact) {
    return (
      <div className="space-y-1 text-xs">
        {login ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="opacity-60">{t.merchant.ownerLogin}:</span>
            <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">{login}</code>
            {showPassword && password ? (
              <>
                <span className="opacity-60">{t.merchant.ownerPassword}:</span>
                <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">{password}</code>
                <Button type="button" size="sm" variant="secondary" onClick={() => copyValue(t.merchant.ownerPassword, password)}>
                  {t.staff.copyPassword}
                </Button>
              </>
            ) : showPassword ? (
              <span className="text-zinc-400">{t.staff.noPassword}</span>
            ) : null}
          </div>
        ) : (
          <span className="text-zinc-400">{t.merchant.noOwnerAccount}</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <p className="text-sm font-semibold">{t.merchant.ownerCredentialsTitle}</p>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{t.merchant.ownerCredentialsHint}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs opacity-60">{t.merchant.ownerFullName}</dt>
          <dd>{fullName || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">{t.merchant.ownerLogin}</dt>
          <dd className="flex flex-wrap items-center gap-2">
            {login ? (
              <>
                <code className="rounded bg-white px-2 py-1 text-xs dark:bg-zinc-900">{login}</code>
                <Button type="button" size="sm" variant="secondary" onClick={() => copyValue(t.merchant.ownerLogin, login)}>
                  {t.staff.copyPassword}
                </Button>
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
        {showPassword ? (
          <div className="sm:col-span-2">
            <dt className="text-xs opacity-60">{t.merchant.ownerPassword}</dt>
            <dd className="flex flex-wrap items-center gap-2">
              {password ? (
                <>
                  <code className="rounded bg-white px-2 py-1 text-xs dark:bg-zinc-900">{password}</code>
                  <Button type="button" size="sm" variant="secondary" onClick={() => copyValue(t.merchant.ownerPassword, password)}>
                    {t.staff.copyPassword}
                  </Button>
                </>
              ) : (
                <span className="text-zinc-400">{t.staff.noPassword}</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function MerchantOwnerAccountFields({
  form,
  setForm,
}: {
  form: {
    ownerLogin?: string;
    ownerPassword?: string;
    ownerFullName?: string;
  };
  setForm: (value: {
    ownerLogin?: string;
    ownerPassword?: string;
    ownerFullName?: string;
  }) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-zinc-300 p-3 dark:border-white/20">
      <p className="text-sm font-semibold">{t.merchant.ownerAccountSection}</p>
      <p className="text-xs text-zinc-500">{t.merchant.ownerAccountSectionHint}</p>
      <Input
        placeholder={t.merchant.ownerFullName}
        value={form.ownerFullName ?? ''}
        onChange={(e) => setForm({ ...form, ownerFullName: e.target.value })}
      />
      <Input
        placeholder={t.merchant.ownerLogin}
        value={form.ownerLogin ?? ''}
        onChange={(e) => setForm({ ...form, ownerLogin: e.target.value })}
      />
      <PasswordInput
        placeholder={t.merchant.ownerPasswordNew}
        value={form.ownerPassword ?? ''}
        onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
      />
    </div>
  );
}

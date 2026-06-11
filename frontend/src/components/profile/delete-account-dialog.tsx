'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestAccountDeletion } from '@/lib/account-deletion';
import { clearCustomerSession } from '@/lib/customer';

type Props = {
  phone: string;
  token: string;
  onClose: () => void;
};

export function DeleteAccountDialog({ phone, token, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await requestAccountDeletion({ phone }, token);
      await clearCustomerSession();
      window.location.href = '/delete-account?deleted=1';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <h2 id="delete-account-title" className="text-lg font-bold text-zinc-900">
              Delete Account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              This action is permanent. Your profile, phone number, saved addresses, location
              information, notification tokens, authentication data and personal information will be
              deleted and cannot be recovered.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" className="flex-1" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  );
}

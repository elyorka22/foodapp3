import { api } from '@/lib/api';

export type DeleteAccountRequest = {
  phone: string;
  email?: string;
  reason?: string;
};

export type DeleteAccountResponse = {
  success: boolean;
  message: string;
  requestId?: string;
};

export async function requestAccountDeletion(
  payload: DeleteAccountRequest,
  token?: string,
): Promise<DeleteAccountResponse> {
  return api<DeleteAccountResponse>('/account/delete-request', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

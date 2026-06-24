import { toast } from 'sonner';
import { uz } from '@/lib/uz';

export function openSocialUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    toast.message(uz.profileSocialLinkMissing);
    return;
  }
  window.open(trimmed, '_blank', 'noopener,noreferrer');
}

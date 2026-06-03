import { redirect } from 'next/navigation';

export default function AdminBannersRedirect() {
  redirect('/admin/banners/promo');
}

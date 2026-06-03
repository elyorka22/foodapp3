import { redirect } from 'next/navigation';

export default function StoreCategoriesRedirect() {
  redirect('/admin/dish-categories');
}

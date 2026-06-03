import { redirect } from 'next/navigation';

export default function RestaurantCategoriesRedirect() {
  redirect('/admin/dish-categories');
}

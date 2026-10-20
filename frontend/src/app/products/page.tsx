import { redirect } from 'next/navigation';

/** Legacy /products → grocery marketplace store list. */
export default function ProductsPage() {
  redirect('/stores?type=grocery');
}

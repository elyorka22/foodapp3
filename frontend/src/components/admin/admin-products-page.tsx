'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { uploadImage } from '@/lib/upload';
import { useAdminProducts, type ProductForm } from '@/hooks/use-admin-products';
import { adminI18n } from '@/lib/admin-i18n';
import Link from 'next/link';
import { useDishCategories } from '@/hooks/use-dish-categories';
import { useAdminDishCategories } from '@/hooks/use-admin-dish-categories';
import { useAdminProductCategories } from '@/hooks/use-admin-product-categories';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { SearchInput } from '@/components/admin/filters';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveFormSlug } from '@/lib/slugify';

const emptyProduct: ProductForm = {
  restaurantId: '',
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  price: 0,
  isAvailable: true,
};

type Props = {
  vertical?: 'restaurant' | 'store';
};

export function AdminProductsPage({ vertical }: Props) {
  const token = getToken();
  const menuPermission = vertical === 'store' ? 'store.products' : 'restaurant.menu';
  const { ready, authorized } = useAdminAccess({ permission: menuPermission });
  const [search, setSearch] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const isAvailableFilter = availability === '' ? undefined : availability === 'yes';

  const { list, create, update, remove, bulk, addImage } = useAdminProducts({
    page,
    limit: 20,
    search: search || undefined,
    restaurantId: restaurantId || undefined,
    categoryId: categoryId || undefined,
    isAvailable: isAvailableFilter,
    vertical,
  });

  const { data: publicDishCategories } = useDishCategories();
  const { list: adminDishCategories } = useAdminDishCategories();
  const { list: storeCategories } = useAdminProductCategories(
    vertical === 'store' ? form.restaurantId || restaurantId : undefined,
  );
  const dishCategoryOptions =
    adminDishCategories.data?.length
      ? adminDishCategories.data
      : (publicDishCategories ?? []);
  const categoryOptions =
    vertical === 'store' ? (storeCategories.data ?? []) : dishCategoryOptions;

  useEffect(() => {
    if (!token) return;
    api<{ data: any[] }>(
      `/restaurants/admin?limit=100${vertical ? `&vertical=${vertical}` : ''}`,
      { token },
    )
      .then((res) => setRestaurants(res.data))
      .catch(() => undefined);
  }, [token, vertical]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('restaurantId');
    if (id) setRestaurantId(id);
  }, []);

  const rows = list.data?.data ?? [];
  const totalPages = list.data?.meta?.totalPages ?? 1;
  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const toggleAvailability = async (row: any) => {
    try {
      await update.mutateAsync({ id: row.id, body: { isAvailable: !row.isAvailable } });
      toast.success(row.isAvailable ? 'Product hidden' : 'Product available');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        id: 'image',
        header: 'Image',
        cell: ({ row }) => {
          const url = row.original.images?.[0]?.url;
          return url ? (
            <img src={url} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <span className="text-xs opacity-40">—</span>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs opacity-50">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'restaurant',
        header: 'Restaurant',
        cell: ({ row }) => row.original.restaurant?.name ?? '—',
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) =>
          row.original.category?.name ??
          row.original.dishCategory?.name ??
          row.original.productCategory?.name ??
          '—',
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => `${Number(row.original.price).toLocaleString()} UZS`,
      },
      {
        id: 'available',
        header: 'Availability',
        cell: ({ row }) => (
          <button type="button" onClick={() => toggleAvailability(row.original)}>
            <ActiveBadge
              active={row.original.isAvailable}
              label={row.original.isAvailable ? 'On site' : 'Hidden from site'}
            />
          </button>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Button type="button" variant="danger" onClick={() => setDeleteId(row.original.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const openEdit = (row: any) => {
    setEditRow(row);
    setImageFile(null);
    setForm({
      restaurantId: row.restaurantId,
      categoryId: row.dishCategoryId ?? row.categoryId ?? '',
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      price: Number(row.price),
      isAvailable: row.isAvailable,
    });
  };

  const saveWithImage = async (productId: string) => {
    if (imageFile) {
      const { url } = await uploadImage(imageFile);
      await addImage.mutateAsync({ id: productId, url });
    }
  };

  const buildProductPayload = (existingSlug?: string | null) => {
    const base = {
      restaurantId: form.restaurantId,
      name: form.name.trim(),
      slug: resolveFormSlug(form.name.trim(), existingSlug),
      description: form.description?.trim() || undefined,
      price: form.price,
      isAvailable: form.isAvailable ?? true,
    };
    if (vertical === 'store') {
      return { ...base, productCategoryId: form.categoryId || undefined };
    }
    return { ...base, dishCategoryId: form.categoryId || undefined };
  };

  const submitCreate = async () => {
    if (!form.restaurantId) {
      toast.error('Select a restaurant for this product');
      return;
    }
    if (!form.categoryId) {
      toast.error(
        vertical === 'store'
          ? "Do'kon kategoriyasini tanlang"
          : 'Taom kategoriyasini tanlang (umumiy ro‘yxatdan)',
      );
      return;
    }
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const created: any = await create.mutateAsync(buildProductPayload());
      if (imageFile && created?.id) await saveWithImage(created.id);
      setCreateOpen(false);
      setForm(emptyProduct);
      setImageFile(null);
      toast.success('Product created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    if (!form.categoryId) {
      toast.error(
        vertical === 'store'
          ? "Do'kon kategoriyasini tanlang"
          : 'Taom kategoriyasini tanlang (umumiy ro‘yxatdan)',
      );
      return;
    }
    try {
      const body =
        vertical === 'store'
          ? {
              name: form.name.trim(),
              slug: resolveFormSlug(form.name.trim(), editRow.slug),
              description: form.description?.trim() || undefined,
              price: form.price,
              isAvailable: form.isAvailable,
              productCategoryId: form.categoryId,
            }
          : {
              name: form.name.trim(),
              slug: resolveFormSlug(form.name.trim(), editRow.slug),
              description: form.description?.trim() || undefined,
              price: form.price,
              isAvailable: form.isAvailable,
              dishCategoryId: form.categoryId,
            };
      await update.mutateAsync({
        id: editRow.id,
        body,
      });
      if (imageFile) await saveWithImage(editRow.id);
      setEditRow(null);
      setForm(emptyProduct);
      setImageFile(null);
      toast.success('Product updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Product deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const runBulk = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!selectedIds.length) return;
    try {
      await bulk.mutateAsync({ action, ids: selectedIds });
      setRowSelection({});
      toast.success(`Bulk ${action} completed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk action failed');
    }
  };

  const ProductFormFields = (
    <div className="space-y-3">
      <select
        className="w-full rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
        value={form.restaurantId}
        onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
      >
        <option value="">Select restaurant</option>
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <div className="space-y-2">
        <label className="text-xs font-medium opacity-70">
          {vertical === 'store' ? 'Do‘kon kategoriyasi' : 'Taom kategoriyasi (umumiy)'}
        </label>
        <select
          className="w-full rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={form.categoryId ?? ''}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          disabled={vertical === 'store' && !form.restaurantId}
        >
          <option value="">Kategoriyani tanlang</option>
          {categoryOptions.map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!categoryOptions.length && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {vertical === 'store' ? (
              <>
                Kategoriyalar yo‘q —{' '}
                <Link href="/admin/stores/categories" className="font-semibold underline">
                  do‘kon kategoriyalarini yarating
                </Link>
              </>
            ) : (
              <>
                Taom kategoriyalari yo‘q — super admin yoki menejer{' '}
                <Link href="/admin/dish-categories" className="font-semibold underline">
                  umumiy ro‘yxatda yaratadi
                </Link>
              </>
            )}
          </p>
        )}
        {vertical !== 'store' && categoryOptions.length > 0 && (
          <p className="text-xs text-zinc-500">
            Restoran o‘z kategoriyasini yaratmaydi — faqat umumiy ro‘yxatdan tanlang.
          </p>
        )}
      </div>
      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Description"
        value={form.description ?? ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
      />
      <label className="text-xs opacity-70">
        Product image
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-xs"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isAvailable ?? true}
          onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
        />
        Available
      </label>
    </div>
  );

  if (!ready) return <TableSkeleton rows={8} cols={8} />;
  if (!authorized) return null;
  if (list.isLoading) return <TableSkeleton rows={8} cols={8} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load products"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">
          {vertical === 'store'
            ? adminI18n.products.storeProducts
            : vertical === 'restaurant'
              ? adminI18n.products.restaurantProducts
              : adminI18n.products.title}
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/dish-categories">
            <Button type="button" variant="secondary">
              Taom kategoriyalari
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => {
              setForm({
                ...emptyProduct,
                restaurantId: restaurantId || restaurants[0]?.id || '',
                categoryId: categoryId || '',
              });
              setImageFile(null);
              setCreateOpen(true);
            }}
          >
            Add product
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-5">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={restaurantId}
            onChange={(e) => { setRestaurantId(e.target.value); setCategoryId(''); setPage(1); }}
          >
            <option value="">All restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            disabled={vertical === 'store' && !restaurantId}
          >
            <option value="">All categories</option>
            {categoryOptions.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={availability}
            onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
          >
            <option value="">All availability</option>
            <option value="yes">Available</option>
            <option value="no">Hidden</option>
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch('');
              setRestaurantId('');
              setCategoryId('');
              setAvailability('');
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
          <span className="text-sm opacity-70">{selectedIds.length} selected</span>
          <Button type="button" variant="secondary" onClick={() => runBulk('activate')}>
            Activate
          </Button>
          <Button type="button" variant="secondary" onClick={() => runBulk('deactivate')}>
            Deactivate
          </Button>
          <Button type="button" variant="danger" onClick={() => runBulk('delete')}>
            Delete
          </Button>
        </div>
      )}

      {!rows.length ? (
        <EmptyState title="No products" description="Add a product or change filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t dark:border-white/10">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm opacity-70">
            Page {page} of {totalPages}
          </span>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal open={createOpen} title="Add product" onClose={() => setCreateOpen(false)}>
        {ProductFormFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submitCreate} disabled={create.isPending}>
            Create
          </Button>
        </div>
      </Modal>

      <Modal open={!!editRow} title="Edit product" onClose={() => setEditRow(null)}>
        {ProductFormFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={submitEdit} disabled={update.isPending}>
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete product?"
        description="This soft-deletes the product."
        danger
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

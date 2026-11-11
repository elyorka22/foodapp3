'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useStoreCatalogOffers } from '@/hooks/use-shared-catalog';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useAdminProductCategories } from '@/hooks/use-admin-product-categories';
import { ActiveBadge } from '@/components/admin/active-badge';
import { Modal } from '@/components/admin/modal';
import { EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveFormSlug } from '@/lib/slugify';
import { resolveImageUrl } from '@/lib/image-url';
import { uploadImage } from '@/lib/upload';

type Props = {
  typeSlug: string;
  typeName?: string;
  initialBusinessId?: string;
};

export function StoreCatalogOffersPage({
  typeSlug,
  typeName,
  initialBusinessId,
}: Props) {
  const token = getToken();
  const { ready, authorized } = useAdminAccess({ permission: 'store.products' });
  const [stores, setStores] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState(initialBusinessId ?? '');
  const { list, enroll, updateOffer } = useStoreCatalogOffers(businessId || undefined);
  const { addImage } = useAdminProducts({
    page: 1,
    limit: 1,
    restaurantId: businessId || undefined,
    vertical: 'store',
  });
  const { list: categories } = useAdminProductCategories({ typeSlug });
  const [uniqueOpen, setUniqueOpen] = useState(false);
  const [uniqueForm, setUniqueForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
  });
  const [uniqueImage, setUniqueImage] = useState<File | null>(null);

  useEffect(() => {
    if (!token) return;
    const qs = new URLSearchParams({ limit: '100', vertical: 'store', type: typeSlug });
    api<{ data: any[] }>(`/restaurants/admin?${qs.toString()}`, { token })
      .then((res) => {
        setStores(res.data);
        setBusinessId((prev) => {
          if (prev && res.data.some((r) => r.id === prev)) return prev;
          if (initialBusinessId && res.data.some((r) => r.id === initialBusinessId)) {
            return initialBusinessId;
          }
          return res.data[0]?.id ?? '';
        });
      })
      .catch(() => undefined);
  }, [token, typeSlug, initialBusinessId]);

  if (!ready) return <LoadingState label="Yuklanmoqda..." />;
  if (!authorized) return null;

  const offers = list.data ?? [];

  const onEnroll = async () => {
    if (!businessId) return;
    try {
      const res = await enroll.mutateAsync();
      toast.success(
        `Katalog ulandi: +${res.created} (o'tkazib yuborildi: ${res.skipped})`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ulanishda xatolik');
    }
  };

  const savePrice = async (offerId: string, price: number) => {
    try {
      await updateOffer.mutateAsync({ id: offerId, body: { price } });
      toast.success('Narx saqlandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const toggleField = async (
    offerId: string,
    field: 'isAvailable' | 'isListed',
    value: boolean,
  ) => {
    try {
      await updateOffer.mutateAsync({ id: offerId, body: { [field]: value } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const submitUnique = async () => {
    if (!businessId) return;
    if (!uniqueForm.name.trim() || !uniqueForm.categoryId) {
      toast.error("Nom va kategoriya majburiy");
      return;
    }
    try {
      const created: any = await api('/products', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          restaurantId: businessId,
          productCategoryId: uniqueForm.categoryId,
          name: uniqueForm.name.trim(),
          slug: resolveFormSlug(uniqueForm.name.trim()),
          description: uniqueForm.description.trim() || undefined,
          price: uniqueForm.price,
          isAvailable: true,
        }),
      });
      if (uniqueImage && created?.id) {
        const { url } = await uploadImage(uniqueImage);
        await addImage.mutateAsync({ id: created.id, url });
      }
      toast.success("O'z mahsuloti qo'shildi");
      setUniqueOpen(false);
      setUniqueForm({ name: '', description: '', categoryId: '', price: 0 });
      setUniqueImage(null);
      void list.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/stores/type/${encodeURIComponent(typeSlug)}/products`}
            className="text-xs opacity-60 hover:underline"
          >
            ← Umumiy katalog
          </Link>
          <h1 className="mt-1 text-lg font-semibold">
            {typeName ?? typeSlug} — do&apos;kon takliflari
          </h1>
          <p className="text-sm opacity-60">
            Katalogni ulang, narx va mavjudlikni sozlang, yoki o&apos;z SKU qo&apos;shing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onEnroll}
            disabled={!businessId || enroll.isPending}
          >
            Katalogni ulash
          </Button>
          <Button
            type="button"
            onClick={() => setUniqueOpen(true)}
            disabled={!businessId}
          >
            + O&apos;z mahsuloti
          </Button>
        </div>
      </div>

      <select
        className="w-full max-w-md rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        value={businessId}
        onChange={(e) => setBusinessId(e.target.value)}
      >
        <option value="">Do&apos;kon tanlang</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {!businessId ? (
        <EmptyState title="Do'kon tanlang" />
      ) : list.isLoading ? (
        <LoadingState label="Takliflar..." />
      ) : !offers.length ? (
        <EmptyState
          title="Takliflar yo'q"
          description='"Katalogni ulash" tugmasi bilan umumiy mahsulotlarni ulang.'
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3">Narx</th>
                <th className="px-4 py-3">Omborda</th>
                <th className="px-4 py-3">Menyuda</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const img =
                  offer.product?.images?.find((i: any) => i.isPrimary) ??
                  offer.product?.images?.[0];
                const url = resolveImageUrl(img?.url);
                return (
                  <tr key={offer.id} className="border-t dark:border-white/10">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {url ? (
                          <img
                            src={url}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="font-medium">{offer.product?.name}</p>
                          <p className="text-xs opacity-50">
                            {offer.product?.productCategory?.name ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={0}
                        className="w-36"
                        defaultValue={offer.price ?? ''}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next !== Number(offer.price ?? NaN)) {
                            void savePrice(offer.id, next);
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleField(offer.id, 'isAvailable', !offer.isAvailable)
                        }
                      >
                        <ActiveBadge
                          active={!!offer.isAvailable}
                          label={offer.isAvailable ? 'Bor' : "Yo'q"}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleField(offer.id, 'isListed', !offer.isListed)
                        }
                      >
                        <ActiveBadge
                          active={!!offer.isListed}
                          label={offer.isListed ? 'Ko‘rinadi' : 'Yashirilgan'}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={uniqueOpen}
        onClose={() => setUniqueOpen(false)}
        title="O'z mahsulotini qo'shish"
      >
        <div className="space-y-3">
          <Input
            placeholder="Nom"
            value={uniqueForm.name}
            onChange={(e) => setUniqueForm((f) => ({ ...f, name: e.target.value }))}
          />
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
            placeholder="Tavsif"
            rows={3}
            value={uniqueForm.description}
            onChange={(e) =>
              setUniqueForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={uniqueForm.categoryId}
            onChange={(e) =>
              setUniqueForm((f) => ({ ...f, categoryId: e.target.value }))
            }
          >
            <option value="">Kategoriya</option>
            {(categories.data ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={0}
            placeholder="Narx"
            value={uniqueForm.price || ''}
            onChange={(e) =>
              setUniqueForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
            }
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUniqueImage(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setUniqueOpen(false)}>
            Bekor
          </Button>
          <Button type="button" onClick={submitUnique}>
            Saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
}

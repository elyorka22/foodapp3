'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/admin/modal';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';
import type { BookingSlide, BookingVenue, BookingVenueType } from '@/hooks/use-booking-data';

type VenueForm = {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  coverUrl: string;
  venueType: BookingVenueType;
  highlights: string;
  isActive: boolean;
};

type SlideForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  bookingVenueId: string;
  isActive: boolean;
};

const emptyVenue: VenueForm = {
  name: '',
  slug: '',
  description: '',
  address: '',
  phone: '',
  coverUrl: '',
  venueType: 'BOTH',
  highlights: '',
  isActive: true,
};

const emptySlide: SlideForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  bookingVenueId: '',
  isActive: true,
};

export default function AdminBookingVenuesPage() {
  const token = getToken();
  const qc = useQueryClient();
  const [venueModal, setVenueModal] = useState(false);
  const [slideModal, setSlideModal] = useState(false);
  const [editVenueId, setEditVenueId] = useState<string | null>(null);
  const [editSlideId, setEditSlideId] = useState<string | null>(null);
  const [venueForm, setVenueForm] = useState<VenueForm>(emptyVenue);
  const [slideForm, setSlideForm] = useState<SlideForm>(emptySlide);

  const venues = useQuery({
    queryKey: ['admin-booking-venues'],
    queryFn: () => api<BookingVenue[]>('/booking/admin/venues', { token: token ?? undefined }),
    enabled: !!token,
  });

  const slides = useQuery({
    queryKey: ['admin-booking-slides'],
    queryFn: () => api<BookingSlide[]>('/booking/admin/slides', { token: token ?? undefined }),
    enabled: !!token,
  });

  const saveVenue = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editVenueId
        ? api(`/booking/admin/venues/${editVenueId}`, {
            method: 'PATCH',
            token: token ?? undefined,
            body: JSON.stringify(body),
          })
        : api('/booking/admin/venues', {
            method: 'POST',
            token: token ?? undefined,
            body: JSON.stringify(body),
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking-venues'] });
      setVenueModal(false);
      toast.success('Saqlandi');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveSlide = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editSlideId
        ? api(`/booking/admin/slides/${editSlideId}`, {
            method: 'PATCH',
            token: token ?? undefined,
            body: JSON.stringify(body),
          })
        : api('/booking/admin/slides', {
            method: 'POST',
            token: token ?? undefined,
            body: JSON.stringify(body),
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking-slides'] });
      setSlideModal(false);
      toast.success('Saqlandi');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteVenue = useMutation({
    mutationFn: (id: string) =>
      api(`/booking/admin/venues/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking-venues'] });
      toast.success("O'chirildi");
    },
  });

  const deleteSlide = useMutation({
    mutationFn: (id: string) =>
      api(`/booking/admin/slides/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking-slides'] });
      toast.success("O'chirildi");
    },
  });

  const openCreateVenue = () => {
    setEditVenueId(null);
    setVenueForm(emptyVenue);
    setVenueModal(true);
  };

  const openEditVenue = (v: BookingVenue) => {
    setEditVenueId(v.id);
    setVenueForm({
      name: v.name,
      slug: v.slug,
      description: v.description ?? '',
      address: v.address ?? '',
      phone: v.phone ?? '',
      coverUrl: v.coverUrl ?? '',
      venueType: v.venueType,
      highlights: (v.highlights ?? []).join(', '),
      isActive: true,
    });
    setVenueModal(true);
  };

  const openCreateSlide = () => {
    setEditSlideId(null);
    setSlideForm(emptySlide);
    setSlideModal(true);
  };

  const submitVenue = () => {
    if (!venueForm.name.trim()) {
      toast.error('Nom kiriting');
      return;
    }
    saveVenue.mutate({
      name: venueForm.name.trim(),
      slug: venueForm.slug.trim() || undefined,
      description: venueForm.description.trim() || undefined,
      address: venueForm.address.trim() || undefined,
      phone: venueForm.phone.trim() || undefined,
      coverUrl: venueForm.coverUrl || undefined,
      venueType: venueForm.venueType,
      highlights: venueForm.highlights
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: venueForm.isActive,
    });
  };

  const submitSlide = () => {
    if (!slideForm.imageUrl.trim()) {
      toast.error('Rasm yuklang');
      return;
    }
    saveSlide.mutate({
      title: slideForm.title.trim(),
      subtitle: slideForm.subtitle.trim() || undefined,
      imageUrl: slideForm.imageUrl,
      bookingVenueId: slideForm.bookingVenueId || undefined,
      isActive: slideForm.isActive,
    });
  };

  const onVenueImage = async (file: File) => {
    const { url } = await uploadImage(file);
    setVenueForm((f) => ({ ...f, coverUrl: url }));
  };

  const onSlideImage = async (file: File) => {
    const { url } = await uploadImage(file);
    setSlideForm((f) => ({ ...f, imageUrl: url }));
  };

  return (
    <AdminPageGuard permission="booking">
      <div className="space-y-8 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Stol bron joylari</h1>
            <p className="text-sm text-zinc-500">
              /booking sahifasidagi restoranlar, zallar va promo slaydlar
            </p>
          </div>
          <Button type="button" onClick={openCreateVenue}>
            <Plus size={16} className="mr-1" />
            Joy qo&apos;shish
          </Button>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold">Joylar</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(venues.data ?? []).map((v) => (
              <div
                key={v.id}
                className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-xs text-zinc-500">/{v.slug}</p>
                    <p className="mt-1 text-xs">{v.venueType}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="secondary" onClick={() => openEditVenue(v)}>
                      Tahrirlash
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteVenue.mutate(v.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Promo slaydlar (booking hero)</h2>
            <Button type="button" variant="secondary" onClick={openCreateSlide}>
              <Plus size={16} className="mr-1" />
              Slayd
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {(slides.data ?? []).map((s) => (
              <div
                key={s.id}
                className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
              >
                <p className="font-semibold">{s.title || '—'}</p>
                <p className="text-xs text-zinc-500">{s.subtitle}</p>
                {s.venue ? <p className="mt-1 text-xs">→ {s.venue.name}</p> : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => deleteSlide.mutate(s.id)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Modal open={venueModal} title={editVenueId ? 'Joyni tahrirlash' : 'Joy qo&apos;shish'} onClose={() => setVenueModal(false)}>
        <div className="space-y-3">
          <Input placeholder="Nom" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
          <Input placeholder="Slug (ixtiyoriy)" value={venueForm.slug} onChange={(e) => setVenueForm({ ...venueForm, slug: e.target.value })} />
          <Input placeholder="Tavsif" value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} />
          <Input placeholder="Manzil" value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} />
          <Input placeholder="Telefon" value={venueForm.phone} onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })} />
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={venueForm.venueType}
            onChange={(e) => setVenueForm({ ...venueForm, venueType: e.target.value as BookingVenueType })}
          >
            <option value="TABLE">Stol</option>
            <option value="HALL">Zal</option>
            <option value="BOTH">Stol va zal</option>
          </select>
          <Input
            placeholder="Teglar (vergul bilan): VIP zal, Terrasa"
            value={venueForm.highlights}
            onChange={(e) => setVenueForm({ ...venueForm, highlights: e.target.value })}
          />
          <label className="block text-xs">
            Muqova rasm
            <input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(e) => e.target.files?.[0] && onVenueImage(e.target.files[0])} />
          </label>
          <Button type="button" onClick={submitVenue} disabled={saveVenue.isPending}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <Modal open={slideModal} title="Promo slayd" onClose={() => setSlideModal(false)}>
        <div className="space-y-3">
          <Input placeholder="Sarlavha" value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} />
          <Input placeholder="Pastki matn" value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} />
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={slideForm.bookingVenueId}
            onChange={(e) => setSlideForm({ ...slideForm, bookingVenueId: e.target.value })}
          >
            <option value="">— Joy tanlang (ixtiyoriy) —</option>
            {(venues.data ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <label className="block text-xs">
            Rasm *
            <input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(e) => e.target.files?.[0] && onSlideImage(e.target.files[0])} />
          </label>
          <Button type="button" onClick={submitSlide} disabled={saveSlide.isPending}>
            Saqlash
          </Button>
        </div>
      </Modal>
    </AdminPageGuard>
  );
}

'use client';

import type { RestaurantForm } from '@/hooks/use-admin-restaurants';
import { ImageFramingControls } from '@/components/admin/image-framing-controls';

type Props = {
  form: RestaurantForm;
  setForm: (f: RestaurantForm) => void;
};

export function CoverPositionControls({ form, setForm }: Props) {
  if (!form.coverUrl) return null;

  return (
    <ImageFramingControls
      label="Restoran kartochkasi — rasm joylashuvi"
      imageUrl={form.coverUrl}
      previewAspectClass="aspect-[2/1]"
      previewMaxWidthClass="max-w-[220px]"
      values={{
        imageScale: form.coverScale ?? 100,
        imagePositionX: form.coverPositionX ?? 50,
        imagePositionY: form.coverPositionY ?? 50,
      }}
      onChange={(v) =>
        setForm({
          ...form,
          coverScale: v.imageScale ?? 100,
          coverPositionX: v.imagePositionX ?? 50,
          coverPositionY: v.imagePositionY ?? 50,
        })
      }
    />
  );
}

'use client';

import type { AdminSettings } from '@/hooks/use-admin-settings';
import { ImageFramingControls } from '@/components/admin/image-framing-controls';

type Props = {
  form: AdminSettings;
  setForm: (f: AdminSettings) => void;
  sampleBannerUrl?: string | null;
  sampleRestaurantCoverUrl?: string | null;
};

export function AdminImageFramingSettings({
  form,
  setForm,
  sampleBannerUrl,
  sampleRestaurantCoverUrl,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ImageFramingControls
        label="Barcha bannerlar — standart (yangi bannerlar)"
        imageUrl={sampleBannerUrl}
        previewAspectClass="aspect-[2/1]"
        values={{
          imageScale: form.banner_default_image_scale ?? 100,
          imagePositionX: form.banner_default_image_position_x ?? 50,
          imagePositionY: form.banner_default_image_position_y ?? 50,
        }}
        onChange={(v) =>
          setForm({
            ...form,
            banner_default_image_scale: v.imageScale ?? 100,
            banner_default_image_position_x: v.imagePositionX ?? 50,
            banner_default_image_position_y: v.imagePositionY ?? 50,
          })
        }
      />
      <ImageFramingControls
        label="Restoran kartochkalari — standart"
        imageUrl={sampleRestaurantCoverUrl}
        previewAspectClass="aspect-[2/1]"
        values={{
          imageScale: form.restaurant_card_default_image_scale ?? 100,
          imagePositionX: form.restaurant_card_default_cover_position_x ?? 50,
          imagePositionY: form.restaurant_card_default_cover_position_y ?? 50,
        }}
        onChange={(v) =>
          setForm({
            ...form,
            restaurant_card_default_image_scale: v.imageScale ?? 100,
            restaurant_card_default_cover_position_x: v.imagePositionX ?? 50,
            restaurant_card_default_cover_position_y: v.imagePositionY ?? 50,
          })
        }
      />
    </div>
  );
}

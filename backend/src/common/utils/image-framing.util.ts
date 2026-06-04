export type ImageFraming = {
  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;
};

export type ImageFramingDefaults = {
  banner_default_image_scale: number;
  banner_default_image_position_x: number;
  banner_default_image_position_y: number;
  restaurant_card_default_image_scale: number;
  restaurant_card_default_cover_position_x: number;
  restaurant_card_default_cover_position_y: number;
};

export const DEFAULT_IMAGE_FRAMING: ImageFramingDefaults = {
  banner_default_image_scale: 100,
  banner_default_image_position_x: 50,
  banner_default_image_position_y: 50,
  restaurant_card_default_image_scale: 100,
  restaurant_card_default_cover_position_x: 50,
  restaurant_card_default_cover_position_y: 50,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function resolveBannerFraming(
  row: {
    imageScale?: number | null;
    imagePositionX?: number | null;
    imagePositionY?: number | null;
  },
  defaults: ImageFramingDefaults,
): ImageFraming {
  return {
    imageScale: clamp(
      row.imageScale ?? defaults.banner_default_image_scale,
      50,
      200,
    ),
    imagePositionX: clamp(
      row.imagePositionX ?? defaults.banner_default_image_position_x,
      0,
      100,
    ),
    imagePositionY: clamp(
      row.imagePositionY ?? defaults.banner_default_image_position_y,
      0,
      100,
    ),
  };
}

export function resolveRestaurantCoverFraming(
  row: {
    coverScale?: number | null;
    coverPositionX?: number | null;
    coverPositionY?: number | null;
  },
  defaults: ImageFramingDefaults,
): ImageFraming & { coverScale: number; coverPositionX: number; coverPositionY: number } {
  return {
    coverScale: clamp(
      row.coverScale ?? defaults.restaurant_card_default_image_scale,
      50,
      200,
    ),
    coverPositionX: clamp(
      row.coverPositionX ?? defaults.restaurant_card_default_cover_position_x,
      0,
      100,
    ),
    coverPositionY: clamp(
      row.coverPositionY ?? defaults.restaurant_card_default_cover_position_y,
      0,
      100,
    ),
    imageScale: clamp(
      row.coverScale ?? defaults.restaurant_card_default_image_scale,
      50,
      200,
    ),
    imagePositionX: clamp(
      row.coverPositionX ?? defaults.restaurant_card_default_cover_position_x,
      0,
      100,
    ),
    imagePositionY: clamp(
      row.coverPositionY ?? defaults.restaurant_card_default_cover_position_y,
      0,
      100,
    ),
  };
}

export function pickImageFramingDefaults(
  admin: Partial<ImageFramingDefaults>,
): ImageFramingDefaults {
  return { ...DEFAULT_IMAGE_FRAMING, ...admin };
}

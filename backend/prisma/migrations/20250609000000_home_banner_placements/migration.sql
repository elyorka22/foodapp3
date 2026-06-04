-- Home page banner grid placements (large left + two stacked right).

ALTER TYPE "BannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_MAIN';
ALTER TYPE "BannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_SIDE_TOP';
ALTER TYPE "BannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_SIDE_BOTTOM';

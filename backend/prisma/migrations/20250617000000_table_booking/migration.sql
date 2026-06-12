-- CreateEnum
CREATE TYPE "BookingVenueType" AS ENUM ('TABLE', 'HALL', 'BOTH');

-- CreateTable
CREATE TABLE "booking_venues" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "logo_url" TEXT,
    "cover_url" TEXT,
    "cover_scale" INTEGER NOT NULL DEFAULT 100,
    "cover_position_x" INTEGER NOT NULL DEFAULT 50,
    "cover_position_y" INTEGER NOT NULL DEFAULT 50,
    "venue_type" "BookingVenueType" NOT NULL DEFAULT 'BOTH',
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "booking_venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_slides" (
    "id" UUID NOT NULL,
    "booking_venue_id" UUID,
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "image_scale" INTEGER NOT NULL DEFAULT 100,
    "image_position_x" INTEGER NOT NULL DEFAULT 50,
    "image_position_y" INTEGER NOT NULL DEFAULT 50,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "booking_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_venues_slug_key" ON "booking_venues"("slug");

-- CreateIndex
CREATE INDEX "booking_venues_is_active_sort_order_idx" ON "booking_venues"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "booking_slides_is_active_sort_order_idx" ON "booking_slides"("is_active", "sort_order");

-- AddForeignKey
ALTER TABLE "booking_slides" ADD CONSTRAINT "booking_slides_booking_venue_id_fkey" FOREIGN KEY ("booking_venue_id") REFERENCES "booking_venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveSlugForCreate, resolveSlugForUpdate } from '../../common/utils/slug.util';
import { CreateBookingVenueDto } from './dto/create-booking-venue.dto';
import { UpdateBookingVenueDto } from './dto/update-booking-venue.dto';
import { CreateBookingSlideDto } from './dto/create-booking-slide.dto';
import { UpdateBookingSlideDto } from './dto/update-booking-slide.dto';

@Injectable()
export class BookingVenuesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.bookingVenue.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const venue = await this.prisma.bookingVenue.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
    if (!venue) throw new NotFoundException('Booking venue not found');
    return venue;
  }

  findSlidesPublic() {
    return this.prisma.bookingSlide.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        venue: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.bookingVenue.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findSlidesAdmin() {
    return this.prisma.bookingSlide.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        venue: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async create(dto: CreateBookingVenueDto) {
    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (s) => this.isSlugTaken(s),
    });
    return this.prisma.bookingVenue.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        address: dto.address?.trim() || null,
        phone: dto.phone?.trim() || null,
        logoUrl: dto.logoUrl ?? null,
        coverUrl: dto.coverUrl ?? null,
        coverScale: dto.coverScale ?? 100,
        coverPositionX: dto.coverPositionX ?? 50,
        coverPositionY: dto.coverPositionY ?? 50,
        venueType: dto.venueType ?? 'BOTH',
        highlights: dto.highlights ?? [],
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateBookingVenueDto) {
    await this.assertExists(id);
    const data: Prisma.BookingVenueUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
      ...(dto.address !== undefined && { address: dto.address?.trim() || null }),
      ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
      ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl }),
      ...(dto.coverScale !== undefined && { coverScale: dto.coverScale }),
      ...(dto.coverPositionX !== undefined && { coverPositionX: dto.coverPositionX }),
      ...(dto.coverPositionY !== undefined && { coverPositionY: dto.coverPositionY }),
      ...(dto.venueType !== undefined && { venueType: dto.venueType }),
      ...(dto.highlights !== undefined && { highlights: dto.highlights }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
    };
    if (dto.slug !== undefined) {
      data.slug = await resolveSlugForUpdate({
        slug: dto.slug,
        isTaken: (s) => this.isSlugTaken(s, id),
      });
    } else if (dto.name !== undefined) {
      data.slug = await resolveSlugForCreate({
        name: dto.name,
        isTaken: (s) => this.isSlugTaken(s, id),
      });
    }
    return this.prisma.bookingVenue.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.assertExists(id);
    return this.prisma.bookingVenue.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  createSlide(dto: CreateBookingSlideDto) {
    return this.prisma.bookingSlide.create({
      data: {
        bookingVenueId: dto.bookingVenueId ?? null,
        title: dto.title?.trim() ?? '',
        subtitle: dto.subtitle?.trim() || null,
        imageUrl: dto.imageUrl,
        imageScale: dto.imageScale ?? 100,
        imagePositionX: dto.imagePositionX ?? 50,
        imagePositionY: dto.imagePositionY ?? 50,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateSlide(id: string, dto: UpdateBookingSlideDto) {
    await this.assertSlideExists(id);
    return this.prisma.bookingSlide.update({
      where: { id },
      data: {
        ...(dto.bookingVenueId !== undefined && { bookingVenueId: dto.bookingVenueId }),
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle?.trim() || null }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.imageScale !== undefined && { imageScale: dto.imageScale }),
        ...(dto.imagePositionX !== undefined && { imagePositionX: dto.imagePositionX }),
        ...(dto.imagePositionY !== undefined && { imagePositionY: dto.imagePositionY }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async softDeleteSlide(id: string) {
    await this.assertSlideExists(id);
    return this.prisma.bookingSlide.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async isSlugTaken(slug: string, excludeId?: string) {
    const row = await this.prisma.bookingVenue.findFirst({
      where: { slug, deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
    });
    return !!row;
  }

  private async assertExists(id: string) {
    const row = await this.prisma.bookingVenue.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Booking venue not found');
  }

  private async assertSlideExists(id: string) {
    const row = await this.prisma.bookingSlide.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Booking slide not found');
  }
}

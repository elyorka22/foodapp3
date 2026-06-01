import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../domain/business/business.repository';
import { toBusinessPublicDto } from '../../domain/business/business.mapper';
import { paginatedResponse } from '../../common/dto/pagination.dto';
import { BusinessesQueryDto } from './dto/businesses-query.dto';

/**
 * Canonical business (merchant) application service.
 * All public/mobile clients should use /businesses APIs backed by this service.
 */
@Injectable()
export class BusinessesService {
  constructor(private readonly businessRepo: BusinessRepository) {}

  async findAllPublic(query: BusinessesQueryDto) {
    const { rows, total, page, limit } = await this.businessRepo.findAllPublic(query);
    const data = this.businessRepo.serializePublicList(rows);
    return paginatedResponse(data, total, page, limit);
  }

  async findById(id: string) {
    const row = await this.businessRepo.findById(id);
    if (!row) throw new NotFoundException('Business not found');
    return row;
  }

  async findBySlug(slug: string) {
    const row = await this.businessRepo.findBySlug(slug);
    if (!row) throw new NotFoundException('Business not found');
    return row;
  }

  async findOnePublic(idOrSlug: string) {
    const row = await this.businessRepo.findBySlug(idOrSlug).catch(() => null);
    if (row) return row;
    const byId = await this.businessRepo.findById(idOrSlug);
    if (!byId) throw new NotFoundException('Business not found');
    return byId;
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { BusinessesQueryDto } from './dto/businesses-query.dto';
import { isUuid } from '../../common/utils/uuid';

/**
 * Public merchant API — used by web, customer app, courier app, future driver app.
 */
@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private businesses: BusinessesService) {}

  @Get()
  findAll(@Query() query: BusinessesQueryDto) {
    return this.businesses.findAllPublic(query);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    if (isUuid(idOrSlug)) {
      return this.businesses.findById(idOrSlug);
    }
    return this.businesses.findBySlug(idOrSlug);
  }
}

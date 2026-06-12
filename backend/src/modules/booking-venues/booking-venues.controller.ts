import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookingVenuesService } from './booking-venues.service';
import { CreateBookingVenueDto } from './dto/create-booking-venue.dto';
import { UpdateBookingVenueDto } from './dto/update-booking-venue.dto';
import { CreateBookingSlideDto } from './dto/create-booking-slide.dto';
import { UpdateBookingSlideDto } from './dto/update-booking-slide.dto';

@ApiTags('booking')
@Controller('booking')
export class BookingVenuesController {
  constructor(private readonly booking: BookingVenuesService) {}

  @Get('venues')
  findVenuesPublic() {
    return this.booking.findAllPublic();
  }

  @Get('venues/:slug')
  findVenueBySlug(@Param('slug') slug: string) {
    return this.booking.findBySlug(slug);
  }

  @Get('slides')
  findSlidesPublic() {
    return this.booking.findSlidesPublic();
  }

  @Get('admin/venues')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findVenuesAdmin() {
    return this.booking.findAllAdmin();
  }

  @Post('admin/venues')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  createVenue(@Body() dto: CreateBookingVenueDto) {
    return this.booking.create(dto);
  }

  @Patch('admin/venues/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  updateVenue(@Param('id') id: string, @Body() dto: UpdateBookingVenueDto) {
    return this.booking.update(id, dto);
  }

  @Delete('admin/venues/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  deleteVenue(@Param('id') id: string) {
    return this.booking.softDelete(id);
  }

  @Get('admin/slides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findSlidesAdmin() {
    return this.booking.findSlidesAdmin();
  }

  @Post('admin/slides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  createSlide(@Body() dto: CreateBookingSlideDto) {
    return this.booking.createSlide(dto);
  }

  @Patch('admin/slides/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  updateSlide(@Param('id') id: string, @Body() dto: UpdateBookingSlideDto) {
    return this.booking.updateSlide(id, dto);
  }

  @Delete('admin/slides/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  deleteSlide(@Param('id') id: string) {
    return this.booking.softDeleteSlide(id);
  }
}

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
import { DishCategoriesService } from './dish-categories.service';
import { CreateDishCategoryDto } from './dto/create-dish-category.dto';
import { UpdateDishCategoryDto } from './dto/update-dish-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Global dish categories — admin-managed taxonomy for menu items. */
@ApiTags('dish-categories')
@Controller('dish-categories')
export class DishCategoriesController {
  constructor(private dishCategories: DishCategoriesService) {}

  @Get()
  findAllPublic() {
    return this.dishCategories.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findAllAdmin() {
    return this.dishCategories.findAllAdmin();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.dishCategories.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateDishCategoryDto) {
    return this.dishCategories.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateDishCategoryDto) {
    return this.dishCategories.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.dishCategories.softDelete(id);
  }
}

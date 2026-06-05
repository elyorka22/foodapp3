import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE } from '../../common/constants/throttle.constants';
import { OrderStatus, UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { DeliveryQuoteDto } from './dto/delivery-quote.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignCourierDto } from './dto/assign-courier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { OrdersQueryDto } from './dto/orders-query.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('delivery-quote')
  @Throttle({ default: THROTTLE.GUEST_ORDER })
  @ApiOperation({ summary: 'Preview delivery distance and fee for checkout' })
  deliveryQuote(@Body() dto: DeliveryQuoteDto) {
    return this.ordersService.quoteDelivery(dto);
  }

  @Post('guest')
  @Throttle({ default: THROTTLE.GUEST_ORDER })
  @ApiOperation({ summary: 'Place order without registration' })
  createGuestOrder(@Body() dto: CreateGuestOrderDto) {
    return this.ordersService.createGuestOrder(dto);
  }

  @Get('track/:token')
  @Throttle({ default: THROTTLE.TRACK_ORDER })
  @ApiOperation({ summary: 'Track order by token (public)' })
  track(@Param('token') token: string) {
    return this.ordersService.findByTrackingToken(token);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.BUSINESS,
    UserRole.COURIER,
  )
  @ApiOperation({ summary: 'Order status change history' })
  history(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.getStatusHistory(id, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.BUSINESS,
    UserRole.COURIER,
  )
  @ApiOperation({ summary: 'Get order by id (role-filtered)' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.findOneById(id, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.BUSINESS,
    UserRole.COURIER,
  )
  @ApiOperation({ summary: 'List orders (role-filtered)' })
  findAll(
    @Query() query: OrdersQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findAll(query, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.BUSINESS,
    UserRole.COURIER,
  )
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }

  @Post(':id/assign-courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manager assigns courier to order' })
  assignCourier(
    @Param('id') id: string,
    @Body() dto: AssignCourierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.assignCourierByManager(
      id,
      dto.courierId,
      user.sub,
      dto.note,
    );
  }

  @Patch(':id/reassign-courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manager reassigns courier on order' })
  reassignCourier(
    @Param('id') id: string,
    @Body() dto: AssignCourierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.reassignCourier(
      id,
      dto.courierId,
      user.sub,
      dto.note,
    );
  }

  @Patch(':id/remove-courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manager removes courier from order' })
  removeCourier(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.removeCourier(id, user.sub);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Courier accepts available order' })
  acceptAsCourier(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.acceptOrderAsCourier(id, user.sub);
  }
}

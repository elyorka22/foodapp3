import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { CustomerJwtPayload } from './customer-token.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminCustomersQueryDto } from './dto/admin-customers-query.dto';
import { CustomerStatusDto } from './dto/customer-status.dto';
import { CustomerProfileQueryDto } from './dto/customer-profile-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { THROTTLE } from '../../common/constants/throttle.constants';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Post('register')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Register customer (saved to database)' })
  register(@Body() dto: RegisterCustomerDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.customers.register(dto, ip);
  }

  @Post('login')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Login customer by phone (fallback)' })
  login(@Body() dto: LoginCustomerDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.customers.login(dto, ip);
  }

  @Post('otp/request')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Send a 4-digit SMS code to a Uzbekistan phone' })
  requestOtp(@Body() dto: RequestOtpDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.customers.requestOtp(dto, ip);
  }

  @Post('otp/verify')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Verify SMS code and sign in or create the customer' })
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.customers.verifyOtp(dto, ip);
  }

  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current customer profile (JWT)' })
  me(@CurrentCustomer() customer: CustomerJwtPayload) {
    return this.customers.findMe(customer.sub);
  }

  @Patch('me')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save the name shown to couriers and restaurants' })
  updateName(
    @CurrentCustomer() customer: CustomerJwtPayload,
    @Body() dto: UpdateNameDto,
  ) {
    return this.customers.updateName(customer.sub, dto.fullName);
  }

  @Post('complete-profile')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Add phone and optional delivery address after auth' })
  completeProfile(
    @CurrentCustomer() customer: CustomerJwtPayload,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.customers.completeProfile(customer.sub, dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findAllAdmin(@Query() query: AdminCustomersQueryDto) {
    return this.customers.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findAdminOne(@Param('id') id: string) {
    return this.customers.findAdminById(id);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  history(@Param('id') id: string) {
    return this.customers.getHistory(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: CustomerStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customers.updateStatus(id, dto.isActive, user.sub);
  }

  @Get(':id')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({ summary: 'Get customer profile — requires matching phone query param' })
  findOne(@Param('id') id: string, @Query() query: CustomerProfileQueryDto) {
    return this.customers.findByIdVerified(id, query.phone);
  }
}

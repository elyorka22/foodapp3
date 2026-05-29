import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register customer (saved to database)' })
  register(@Body() dto: RegisterCustomerDto) {
    return this.customers.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login customer by phone' })
  login(@Body() dto: LoginCustomerDto) {
    return this.customers.login(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer profile by id' })
  findOne(@Param('id') id: string) {
    return this.customers.findById(id);
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomerJwtPayload } from '../../modules/customers/customer-token.service';

export const CurrentCustomer = createParamDecorator(
  (data: keyof CustomerJwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const customer = request.user as CustomerJwtPayload;
    return data ? customer?.[data] : customer;
  },
);

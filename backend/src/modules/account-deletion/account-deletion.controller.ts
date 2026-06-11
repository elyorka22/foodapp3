import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { THROTTLE } from '../../common/constants/throttle.constants';
import { AccountDeletionService } from './account-deletion.service';
import { DeleteAccountRequestDto } from './dto/delete-account-request.dto';

@ApiTags('account')
@Controller('account')
export class AccountDeletionController {
  constructor(private accountDeletion: AccountDeletionService) {}

  @Post('delete-request')
  @Throttle({ default: THROTTLE.ACCOUNT_DELETION })
  @ApiOperation({
    summary: 'Request account deletion (public form or authenticated profile)',
    description:
      'Public: phone required. Authenticated: Bearer token must match the submitted phone.',
  })
  deleteRequest(@Body() dto: DeleteAccountRequestDto, @Req() req: Request) {
    const authHeader = req.headers.authorization;
    return this.accountDeletion.createDeleteRequest(dto, authHeader);
  }
}

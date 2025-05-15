import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { YieldsService } from './yields.service';
import { PendingTransaction, DelegationInfo, TxReceipt } from '../core/plugins/staking-types';

@Controller('yields')
export class YieldsController {
  constructor(private readonly svc: YieldsService) {}

  @Get('balances')
  async getBalances(@Query('chain') chain: string, @Query('address') address: string): Promise<DelegationInfo> {
    if (!chain || !address) throw new BadRequestException('chain & address required');
    return this.svc.getBalances(chain, address);
  }

  @Post('actions')
  async execAction(@Query('chain') chain: string, @Body() action: PendingTransaction): Promise<TxReceipt> {
    if (!chain || !action) throw new BadRequestException('chain & action required');
    return this.svc.execute(chain, action);
  }
}

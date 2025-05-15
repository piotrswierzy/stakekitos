import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { YieldsService } from './yields.service';
import { PendingTransaction, DelegationInfo, TxReceipt, Validator, UnsignedTx } from '../core/plugins/staking-types';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { PendingTransactionDto } from './dto/pending-transaction.dto';

@ApiTags('yields')
@Controller('yields')
export class YieldsController {
  constructor(private readonly yieldsService: YieldsService) {}

  @Get('balances')
  async getBalances(@Query('chain') chain: string, @Query('address') address: string): Promise<DelegationInfo> {
    if (!chain || !address) throw new BadRequestException('chain & address required');
    return this.yieldsService.getBalances(chain, address);
  }

  @Post('actions')
  @ApiOperation({ summary: 'Execute a pending transaction' })
  @ApiQuery({ name: 'chain', required: true, description: 'The blockchain network' })
  @ApiBody({ type: PendingTransactionDto })
  async executePendingTransaction(
    @Query('chain') chain: string, @Body('action') action: PendingTransactionDto): Promise<TxReceipt> {
    if (!chain || !action) throw new BadRequestException('chain & action required');
    return this.yieldsService.execute(chain, action);
  }

  @Get('validators')
  async getValidators(@Query('chain') chain: string): Promise<Validator[]> {
    if (!chain) throw new BadRequestException('chain required');
    return this.yieldsService.getValidators(chain);
  }

  @Get('claimable-rewards')
  async getClaimableRewards(@Query('chain') chain: string, @Query('address') address: string, @Query('validator') validator: string): Promise<UnsignedTx> {
    if (!chain || !address || !validator) throw new BadRequestException('chain, address & validator required');
    return this.yieldsService.getClaimableRewardsTransaction(chain, address, validator);
  }

  @Get('delegate')
  async getDelegateTransaction(@Query('chain') chain: string, @Query('address') address: string, @Query('validator') validator: string, @Query('amount') amount: string): Promise<UnsignedTx> {
    if (!chain || !address || !validator || !amount) throw new BadRequestException('chain, address, validator & amount required');
    return this.yieldsService.getDelegateTransaction(chain, address, validator, new BigNumber(amount));
  }
}

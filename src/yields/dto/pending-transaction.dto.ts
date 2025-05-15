import { ApiProperty } from '@nestjs/swagger';
import { PendingTransaction } from '../../core/plugins/staking-types';

export class PendingTransactionDto implements PendingTransaction {
  @ApiProperty()
  providerId: string = '';

  @ApiProperty()
  transactionDefinition: string = '';

  @ApiProperty()
  signedTransaction: string = '';
} 
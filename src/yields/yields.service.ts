import { Injectable } from '@nestjs/common';
import { PluginFactory } from '../core/plugins/plugin.factory';
import { DelegationInfo, PendingTransaction, TxReceipt } from '../core/plugins/staking-types';

@Injectable()
export class YieldsService {
  constructor(private readonly pf: PluginFactory) {}

  async getBalances(chain: string, address: string): Promise<DelegationInfo> {
    const provider = await this.pf.getProvider(chain);
    return provider.queryDelegation(address);
  }

  async execute(chain: string, action: PendingTransaction): Promise<TxReceipt> {
    const provider = await this.pf.getProvider(chain);
    return provider.executeTransaction(action);
  }
}

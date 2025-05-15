import { Injectable } from '@nestjs/common';
import { PluginFactory } from '../core/plugins/plugin.factory';
import { DelegationInfo, PendingTransaction, TxReceipt, UnsignedTx, Validator } from '../core/plugins/staking-types';

@Injectable()
export class YieldsService {
  constructor(private readonly pluginFactory: PluginFactory) {}

  async getBalances(chain: string, address: string): Promise<DelegationInfo> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.queryDelegation(address);
  }

  async getClaimableRewardsTransaction(chain: string, address: string, validator: string): Promise<UnsignedTx> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.claimRewards(address, validator);
  }

  async getDelegateTransaction(chain: string, address: string, validator: string, amount: BigNumber): Promise<UnsignedTx> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.delegate(address, amount, validator);
  }

  async getUndelegateTransaction(chain: string, address: string, validator: string, amount: BigNumber): Promise<UnsignedTx> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.undelegate(address, amount, validator);
  }

  async getDelegationInfo(chain: string, address: string): Promise<DelegationInfo> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.queryDelegation(address);
  }

  async execute(chain: string, action: PendingTransaction): Promise<TxReceipt> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.executeTransaction(action);
  }

  async getValidators(chain: string): Promise<Validator[]> {
    const provider = await this.pluginFactory.getProvider(chain);
    return provider.getValidators();
  }


}

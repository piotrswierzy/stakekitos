import { BigNumber } from 'bignumber.js';
import { IStakingProvider } from '../../core/plugins/staking-provider.interface';
import { Delegation, DelegationInfo, PendingTransaction, StakingOptions, TxReceipt, UnsignedTx } from '../../core/plugins/staking-types';
import { CosmosAdapter } from './cosmos.adapter';
import { CosmosConfig } from './cosmos.types';
import { Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';

export class CosmosProvider implements IStakingProvider {
  private adapter!: CosmosAdapter;
  private readonly registry: Registry = new Registry(defaultRegistryTypes);

  async initialize(config: CosmosConfig): Promise<void> {
    this.adapter = new CosmosAdapter(config);
    await this.adapter.initialize();
  }

  async claimRewards(delegator: string, validator: string): Promise<UnsignedTx> {
    const message = this.adapter.buildL1ClaimRewardsTransaction(delegator, validator);
    const msgBytes: Uint8Array = this.registry.encode(message);
    return {
      transactionDefinition: message.typeUrl,
      txBytes: Buffer.from(msgBytes).toString('hex'),
    };
  }

  async delegate(delegator: string, amount: BigNumber, validator: string, options?: StakingOptions): Promise<UnsignedTx> {
    if (!options?.denom) {
      throw new Error('Denom is required');
    }
    const message = this.adapter.buildL1DelegateTransaction(delegator, validator, amount.toString(), options.denom);
    const msgBytes: Uint8Array = this.registry.encode(message);
    return {
      transactionDefinition: message.typeUrl,
      txBytes: Buffer.from(msgBytes).toString('hex'),
    };
  }

  async queryDelegation(delegator: string): Promise<DelegationInfo> {
    const queryAllDelegations = await this.adapter.queryAllDelegations(delegator);
    const delegations: Delegation[] = queryAllDelegations.map(delegation => ({
      delegatorAddress: delegation.delegation.delegatorAddress,
      validatorAddress: delegation.delegation.validatorAddress,
      balance: new BigNumber(delegation.balance.amount),
    }));

    const totalStaked = await this.adapter.queryTotalStaked(delegator);
    const pendingStakingRewards = await this.adapter.queryPendingRewards(delegator);
    const totalPendingStakingRewards = pendingStakingRewards.reduce((acc, reward) => acc.plus(reward.rewards), new BigNumber('0'));

    return {
      delegations: delegations,
      totalStaked: totalStaked,
      pendingRewards: totalPendingStakingRewards,
      pendingStakingRewards: pendingStakingRewards,
    };
  }

  async undelegate(delegator: string, amount: BigNumber, validator: string, options?: StakingOptions): Promise<UnsignedTx> {
    if (!options?.denom) {
      throw new Error('Denom is required');
    }
    const message = this.adapter.buildL1UndelegateTransaction(delegator, validator, amount.toString(), options.denom);
    const msgBytes: Uint8Array = this.registry.encode(message);
    return {
      transactionDefinition: message.typeUrl,
      txBytes: Buffer.from(msgBytes).toString('hex'),
    };
  }

  async executeTransaction(action: PendingTransaction): Promise<TxReceipt> {
    const result = await this.adapter.executeTransaction(action.signedTransaction);
    return {
      transactionHash: result.transactionHash,
      status: result.code === 0 ? 'success' : 'failed',
    };
  }
}

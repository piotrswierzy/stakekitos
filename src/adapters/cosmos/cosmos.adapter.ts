import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { CosmosConfig, CosmosMessage, MsgDelegateDefinition, MsgUndelegateDefinition, MsgWithdrawDelegatorRewardDefinition, PendingReward } from './cosmos.types';
import { MsgDelegate, MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { DeliverTxResponse, QueryClient, StargateClient, setupDistributionExtension, setupStakingExtension } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { QueryDelegatorDelegationsResponse } from 'cosmjs-types/cosmos/staking/v1beta1/query';
import { DelegationResponse } from 'cosmjs-types/cosmos/staking/v1beta1/staking';
import { TxReceipt } from '../../core/plugins/staking-types';
import { BigNumber } from 'bignumber.js';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';

export class CosmosAdapter {
  private client!: StargateClient;
  private tmClient!: Tendermint34Client;
  private config!: CosmosConfig;
  constructor(config: CosmosConfig) {
    this.config = config;
  }

  public async initialize() {
    this.client = await StargateClient.connect(this.config.rpcUrl);
    this.tmClient = await Tendermint34Client.connect(this.config.rpcUrl);
  }

  public buildL1DelegateTransaction(delegatorAddress: string, validatorAddress: string, amount: string, denom: string): CosmosMessage {
    return {
      typeUrl: MsgDelegateDefinition,
      value: MsgDelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: Coin.fromPartial({
          amount: String(amount),
          denom: denom,
        }),
      }),
    };
  }

  public buildL1UndelegateTransaction(delegatorAddress: string, validatorAddress: string, amount: string, denom: string): CosmosMessage {
    return {
      typeUrl: MsgUndelegateDefinition,
      value: MsgUndelegate.fromPartial({
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: Coin.fromPartial({
          amount: String(amount),
          denom: denom,
        }),
      }),
    };
  }

  public buildL1ClaimRewardsTransaction(delegatorAddress: string, validatorAddress: string): CosmosMessage {
    return {
      typeUrl: MsgWithdrawDelegatorRewardDefinition,
      value: MsgWithdrawDelegatorReward.fromPartial({ delegatorAddress, validatorAddress }),
    };
  }

  async executeTransaction(signedTransaction: string): Promise<DeliverTxResponse> {
    const txBytes = new Uint8Array(Buffer.from(signedTransaction, 'hex'));
    return await this.client.broadcastTx(txBytes);
  }

  public async queryAllDelegations(delegatorAddress: string): Promise<DelegationResponse[]> {
    const queryClient = QueryClient.withExtensions(this.tmClient, setupStakingExtension);

    const { delegationResponses } = await queryClient.staking.delegatorDelegations(delegatorAddress);

    return delegationResponses; // array of { delegation: {validatorAddress, shares}, balance }
  }

  public async queryPendingRewards(delegatorAddress: string): Promise<PendingReward[]> {
    const pending: PendingReward[] = [];
    const queryClient = QueryClient.withExtensions(this.tmClient, setupDistributionExtension);
    const { validators } = await queryClient.distribution.delegatorValidators(delegatorAddress);
    for (const validator of validators) {
      const { rewards } = await queryClient.distribution.delegationRewards(delegatorAddress, validator);
      console.log(rewards);
      if (rewards.some(c => BigInt(c.amount) > 0n)) {
        pending.push({
          validatorAddress: validator,
          rewards,
        });
      }
    }
    return pending;
  }

  public async queryTotalStaked(delegatorAddress: string): Promise<BigNumber> {
    const totalStaked = await this.client.getBalanceStaked(delegatorAddress);
    return new BigNumber(totalStaked?.amount || '0');
  }
}

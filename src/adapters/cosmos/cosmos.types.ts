export const MsgDelegateDefinition = '/cosmos.staking.v1beta1.MsgDelegate';
export const MsgUndelegateDefinition = '/cosmos.staking.v1beta1.MsgUndelegate';
export const MsgBeginRedelegateDefinition = '/cosmos.staking.v1beta1.MsgBeginRedelegate';
export const MsgWithdrawDelegatorRewardDefinition = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';
export const msgWithdrawValidatorCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission';
export const msgSetWithdrawAddress = '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress';

export interface CosmosMessage {
  typeUrl: string;
  value: any;
}

export interface CosmosConfig {
  rpcUrl: string;
}

export interface PendingReward {
  validatorAddress: string;
  rewards: any;
}

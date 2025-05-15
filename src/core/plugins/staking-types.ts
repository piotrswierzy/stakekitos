import BigNumber from 'bignumber.js';

export interface TxReceipt {
  transactionHash: string;
  status: 'pending' | 'success' | 'failed';
}

/**
 */
export interface StakingOptions {
  /** For Stacks PoX: the delegator’s public key. */
  publicKey?: string;
  /** For Cosmos: the denom to delegate */
  denom?: string;
}

export interface UnsignedTx {
  transactionDefinition: string;
  txBytes: string;
}

export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  balance: BigNumber;
}

export interface DelegationInfo {
  delegations: Delegation[];
  totalStaked: BigNumber;
  pendingRewards: BigNumber;
  pendingStakingRewards: PendingStakingReward[];
}

export interface PendingStakingReward {
  validatorAddress: string;
  rewards: BigNumber;
}

export interface PendingAction {
  providerId: string;
  transactionDefinition: string;
  signedTransaction: string;
}

export interface PendingTransaction {
  providerId: string;
  transactionDefinition: string;
  signedTransaction: string;
}

export interface Validator {
  name: string;
  address: string;
}
import BigNumber from 'bignumber.js';

export interface TxReceipt {
  txid: string;
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
  txBytes: string;
}

export interface DelegationInfo {
  totalStaked: BigNumber;
  pendingRewards: BigNumber;
  pendingActions: PendingAction[];
}

export interface PendingAction {
  id: string;
  type: string;
  passthrough: Record<string, any>;
  args?: Record<string, any>;
}

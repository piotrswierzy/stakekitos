import BigNumber from 'bignumber.js';
import { TxReceipt, DelegationInfo, PendingAction, UnsignedTx, StakingOptions } from './staking-types';

export interface IStakingProvider {
  /** Load network-specific config */
  initialize(config: Record<string, any>): Promise<void>;

  /** Stage a fresh delegation transaction */
  delegate(delegator: string, amount: BigNumber, validator: string, options?: StakingOptions): Promise<UnsignedTx>;

  /** Fetch current staking state and available actions */
  queryDelegation(delegator: string): Promise<DelegationInfo>;

  /** Stage an undelegation transaction */
  undelegate(delegator: string, amount: BigNumber, options?: StakingOptions): Promise<UnsignedTx>;

  /** Execute one of the PendingActions returned by `queryDelegation` */
  executeAction(action: PendingAction): Promise<TxReceipt>;
}

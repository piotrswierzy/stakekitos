import fetch from 'node-fetch';
import BigNumber from 'bignumber.js';
import { IStakingProvider } from '../../core/plugins/staking-provider.interface';
import { TxReceipt, DelegationInfo, PendingAction, UnsignedTx, StakingOptions } from '../../core/plugins/staking-types';
import { StacksAdapter } from './stacks.adapter';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

/**
 * StacksProvider implements staking operations against Stacks networks.
 * Clients sign transactions locally; server handles broadcasting.
 */

interface StacksConfig {
  nodeUrl: string;
  pox: { address: string; name: string };
}

export class StacksProvider implements IStakingProvider {
  private adapter!: StacksAdapter;
  private config!: StacksConfig;

  /**
   * Initialize with network config. Detect mainnet vs testnet by URL.
   */
  async initialize(config: StacksConfig): Promise<void> {
    this.config = config;
    const network = config.nodeUrl.includes('mainnet')
      ? STACKS_MAINNET
      : STACKS_TESTNET;
    this.adapter = new StacksAdapter(network, config.pox);
  }

  /**
   * Create unsigned delegation transaction hex. Client will sign locally.
   */
  async delegate(
    delegator: string,
    amount: BigNumber,
    _validator: string,
    options?: StakingOptions
  ): Promise<UnsignedTx> {
    if (!options?.publicKey) {
      throw new Error("Public key is required for Stacks delegation");
    }
    const microstx = amount.multipliedBy(1e6).toFixed();
    const tx = await this.adapter.buildDelegateTx(delegator, microstx, options?.publicKey);
    return { txBytes: tx.serialize() };
  }

  /**
   * Fetch staking state and available pending actions.
   * PendingActions include unsignedTx for client signing.
   */
  async queryDelegation(delegator: string): Promise<DelegationInfo> {
    const resp = await fetch(
      `${this.config.nodeUrl}/v2/pox/stacks_address_info?address=${delegator}`
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch PoX info: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json() as { total_stx_delegated_u: string, pending_btc_rewards_microbtc: string };
    const totalStaked = new BigNumber(data.total_stx_delegated_u).dividedBy(1e6);
    const pendingRewards = new BigNumber(data.pending_btc_rewards_microbtc).dividedBy(1e6);

    const actions: PendingAction[] = [];

    // Claim rewards if any
    if (pendingRewards.gt(0)) {
      const tx = await this.adapter.buildDelegateTx(delegator, '0', '');
      const unsignedTx = tx.txid();
      actions.push({
        id: `claim-${delegator}-${Date.now()}`,
        type: 'CLAIM_REWARDS',
        passthrough: { unsignedTx }
      });
    }

    // Undelegate if staked balance exists
    if (totalStaked.gt(0)) {
      const tx = await this.adapter.buildRevokeTx(delegator);
      const unsignedTx = tx.txid();
      actions.push({
        id: `undelegate-${delegator}-${Date.now()}`,
        type: 'UNDELEGATE',
        passthrough: { unsignedTx },
        args: { maxAmount: totalStaked.toFixed() }
      });
    }

    return {
      totalStaked,
      pendingRewards,
      pendingActions: actions
    };
  }

  /**
   * Create unsigned undelegation transaction hex for client signing.
   */
  async undelegate(
    delegator: string,
    amount: BigNumber,
    options?: StakingOptions
  ): Promise<UnsignedTx> {
    // amount is ignored; revoking delegation uses amount=0
    const tx = await this.adapter.buildRevokeTx(delegator);
    return { txBytes: tx.serialize() };
  }

  /**
   * Broadcast a signed transaction hex that the client returns.
   */
  async executeAction(action: PendingAction): Promise<TxReceipt> {
    const signedHex = action.passthrough.signedTx as string;
    const result = await this.adapter.broadcast(signedHex);
    return { txid: result.txid, status: 'pending' };
  }
}

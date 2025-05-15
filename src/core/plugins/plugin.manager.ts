import { CosmosProvider } from '../../adapters/cosmos/cosmos.provider';
import { IStakingProvider } from './staking-provider.interface';
import { PendingTransaction } from './staking-types';

/**
 * Stateless provider factory: returns a fresh, initialized provider per invocation.
 */

// Mapping of chain IDs to provider factory functions
const providerFactories: Record<string, () => IStakingProvider> = {
  // Single 'stacks' entry handles both mainnet and testnet via configuration
  // Add other chains here, e.g.: 'ethereum': () => new EthereumProvider(),
  'mantra-dukong-1': () => new CosmosProvider(),

};

/**
 * Retrieve and initialize a provider for the given chain.
 * This function is stateless: it creates a new provider instance each call.
 * @param chainId  Unique chain identifier (e.g. 'stacks')
 * @param configs  Full config object loaded from src/config/default.json
 */
export async function getProvider(
  chainId: string,
  configs: Record<string, any>
): Promise<IStakingProvider> {
  const factory = providerFactories[chainId];
  if (!factory) {
    throw new Error(`No provider factory registered for chain '${chainId}'`);
  }
  const provider = factory();
  await provider.initialize(configs[chainId]);
  return provider;
}

/**
 * Convenience wrapper for querying delegation info.
 */
export async function queryDelegation(
  chainId: string,
  configs: Record<string, any>,
  delegator: string
) {
  const provider = await getProvider(chainId, configs);
  return provider.queryDelegation(delegator);
}

/**
 * Convenience wrapper for executing a pending action.
 */
export async function executeTransaction(
  chainId: string,
  configs: Record<string, any>,
  action: PendingTransaction
) {
  const provider = await getProvider(chainId, configs);
  return provider.executeTransaction(action);
}

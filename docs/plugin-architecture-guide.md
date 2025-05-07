# Plugin Architecture & Integration Guide (Chain-Agnostic)

This document explains how plugins work in StakeKitOS and provides a step-by-step guide for adding a new proof-of-stake chain integration.

---

## 1. What is a Plugin?
A **plugin** implements the `IStakingProvider` interface, encapsulating all chain-specific staking operations. Plugins are:

- **Stateless**: instantiated for each request, avoiding shared in-memory state.
- **Modular**: located under `src/adapters/<chain>/` as self-contained folders.
- **Discoverable**: registered via the `plugin.manager.ts` factory for dynamic lookup by chain ID.

---

## 2. Core Interface: `IStakingProvider`
```ts
// src/core/plugins/staking-provider.interface.ts
export interface IStakingProvider {
  /**
   * Prepare plugin with network URLs, contract addresses, or other settings.
   */
  initialize(config: Record<string, any>): Promise<void>;

  /**
   * Build an unsigned transaction to delegate tokens.
   * @param delegator - On-chain address of the delegator
   * @param amount - Amount to delegate (in native token units)
   * @param validator - Identifier of the staking validator (address, ID, or contract)
   * @param opts - Optional protocol-specific parameters
   */
  delegate(
    delegator: string,
    amount: BigNumber,
    validator: string,
    opts?: StakingOptions
  ): Promise<UnsignedTx>;

  /**
   * Build an unsigned transaction to undelegate or revoke tokens.
   */
  undelegate(
    delegator: string,
    amount: BigNumber,
    opts?: StakingOptions
  ): Promise<UnsignedTx>;

  /**
   * Retrieve current staking position, rewards, and next available actions.
   */
  queryDelegation(delegator: string): Promise<DelegationInfo>;

  /**
   * Accept a signed transaction (provided by client) and broadcast it.
   */
  executeAction(action: PendingAction): Promise<TxReceipt>;
}
```

- **Options** (`StakingOptions`) can be used for chain- or implementation-specific parameters (e.g., public key for certain networks, custom fees).

---

## 3. Common Types
```ts
// src/core/plugins/staking-types.ts
export interface TxReceipt {
  txid: string;
  status: 'pending' | 'success' | 'failed';
}

export interface PendingAction {
  id: string;                         // unique identifier
  type: string;                       // e.g. 'DELEGATE', 'UNDELEGATE', 'CLAIM_REWARDS'
  passthrough: Record<string, any>;   // contains unsignedTx, and later signedTx
  args?: Record<string, any>;         // user-promptable parameters (e.g. maxAmount)
}

export interface DelegationInfo {
  totalStaked: BigNumber;
  pendingRewards: BigNumber;
  pendingActions: PendingAction[];
}

// src/core/plugins/staking-options.ts
export interface StakingOptions {
  publicKey?: string;                // e.g. for networks requiring public key
  [key: string]: unknown;            // additional chain-specific options
}
```

---

## 4. Folder Structure
```
src/
├── core/
│   └── plugins/
│       ├── staking-provider.interface.ts
│       ├── staking-types.ts
│       ├── staking-options.ts
│       └── plugin.manager.ts        # Stateless factory for all providers
├── adapters/
│   └── <chain>/
│       ├── <chain>.adapter.ts       # Low-level TX builders & broadcaster
│       └── <chain>.provider.ts      # Implements IStakingProvider
├── config/
│   └── default.json                 # per-chain config sections
└── yields/
    ├── yields.module.ts             # NestJS module wiring
    ├── yields.controller.ts         # REST endpoints
    └── yields.service.ts            # Service invoking plugins
```

---

## 5. Configuration
Add your chain under `src/config/default.json`:
```json
{
  "<chain>": {
    "nodeUrl": "https://<chain>-node",
    "contract": {
      "address": "<contract-address>",
      "name": "<contract-name>"
    }
  }
}
```
The `initialize` method of your provider receives this config object.

---

## 6. Plugin Registration
In `src/core/plugins/plugin.manager.ts`, register your provider factory:
```ts
import { IStakingProvider } from './staking-provider.interface';

const providerFactories: Record<string, () => IStakingProvider> = {
  '<chain>': () => new (require(`../../adapters/<chain>/<chain>.provider`).<ChainName>Provider)(),
  // e.g. 'ethereum': () => new EthereumProvider(),
};
```
Use `getProvider(chainId, configs)` to instantiate and initialize.

---

## 7. Adapter Implementation
Your adapter should:

- Construct unsigned transactions:
  - `buildDelegateTx(delegator, amount, opts?)`
  - `buildRevokeTx(delegator, amount, opts?)`
- Broadcast signed transactions:
  - `broadcast(signedTxHex): Promise<TxBroadcastResult>`

Example signature:
```ts
// <chain>.adapter.ts
export class ChainAdapter {
  constructor(network: NetworkClient, settings: Record<string, any>) {}
  buildDelegateTx(...): UnsignedTx;
  buildRevokeTx(...): UnsignedTx;
  async broadcast(hex: string): Promise<TxBroadcastResult>;
}
```

---

## 8. Provider Implementation
Implement `IStakingProvider` in `<chain>.provider.ts`:
```ts
export class ChainProvider implements IStakingProvider {
  async initialize(config) { /* set up adapter */ }

  async delegate(delegator, amount, validator, opts) {
    const tx = this.adapter.buildDelegateTx(delegator, amount, validator, opts);
    return tx.serialize().toString('hex');
  }

  async undelegate(delegator, amount, opts) { /* similar */ }

  async queryDelegation(delegator) {
    // fetch on-chain data
    // build PendingAction[] with unsignedTx hex
    return { totalStaked, pendingRewards, pendingActions };
  }

  async executeAction(action) {
    const signedHex = action.passthrough.signedTx;
    const result = await this.adapter.broadcast(signedHex);
    return { txid: result.txid, status: 'pending' };
  }
}
```

---

## 9. REST Endpoints (NestJS)
- `GET /api/yields/balances?chain=<chain>&address=<addr>` → `queryDelegation`
- `POST /api/yields/actions?chain=<chain>` → `executeAction`
- *(Optional)* `POST /api/yields/staking/delegate` → build unsigned delegate TX
- *(Optional)* `POST /api/yields/staking/undelegate` → build unsigned undelegate TX

Decorate controllers with `@ApiTags()`, `@ApiOperation()` and use DTOs (`@ApiProperty()`) for Swagger.

---

## 10. Testing
- **Adapter tests** under `test/adapters/<chain>/`: mock SDK TX builders and broadcast calls.
- **Provider tests** under `test/adapters/<chain>/`: mock network RPC/fetch responses and adapter behavior.
- **Controller/Service tests** under `test/yields/`: mock `PluginManager` factory to verify endpoints.

Use `ts-jest` to run TypeScript tests and ensure coverage for all code paths.

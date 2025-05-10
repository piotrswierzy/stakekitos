import { IStakingProvider } from "../../core/plugins/staking-provider.interface";
import { DelegationInfo, PendingAction, StakingOptions, TxReceipt, UnsignedTx } from "../../core/plugins/staking-types";
import { CosmosAdapter } from "./cosmos.adapter";
import { CosmosConfig } from "./cosmos.types";
import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";



export class CosmosProvider implements IStakingProvider {
    private adapter!: CosmosAdapter;
    private readonly registry: Registry = new Registry(defaultRegistryTypes);

    async initialize(config: CosmosConfig): Promise<void> {
        this.adapter = new CosmosAdapter();
    }

    async delegate(delegator: string, amount: BigNumber, validator: string, options?: StakingOptions): Promise<UnsignedTx> {
        if (!options?.denom) {
            throw new Error("Denom is required");
        }
        const message = this.adapter.buildL1DelegateTransaction(delegator, validator, amount.toString(), options.denom);
        console.log("message:  ", message);
        const msgBytes: Uint8Array = this.registry.encode(message);
        return {
            txBytes: msgBytes.toString()
        }
    }

    async queryDelegation(delegator: string): Promise<DelegationInfo> {
        // ... existing code ...
        throw new Error("Method not implemented.");
    }

    async undelegate(delegator: string, amount: BigNumber, options?: StakingOptions): Promise<UnsignedTx> {
        // ... existing code ...
        throw new Error("Method not implemented.");
    }

    async executeAction(action: PendingAction): Promise<TxReceipt> {
        // ... existing code ...
        throw new Error("Method not implemented.");
    }
}
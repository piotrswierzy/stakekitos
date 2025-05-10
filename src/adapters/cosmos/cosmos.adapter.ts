import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { CosmosMessage, MsgDelegateDefinition } from "./cosmos.types";
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';

export class CosmosAdapter {
    constructor() {}
    public buildL1DelegateTransaction(
        delegatorAddress: string,
        validatorAddress: string,
        amount: string,
        denom: string
    ): CosmosMessage {
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
}
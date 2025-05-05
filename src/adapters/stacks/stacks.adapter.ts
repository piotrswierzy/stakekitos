import {
    makeUnsignedContractCall,
    broadcastTransaction,
    TxBroadcastResult,
    uintCV,
    standardPrincipalCV,
    AnchorMode,
    PostConditionMode,
    UnsignedContractCallOptions,
    StacksTransactionWire,
    deserializeTransaction,
  } from '@stacks/transactions';
  import type { StacksNetwork } from '@stacks/network';
  
  /**
   * StacksAdapter handles construction and broadcasting of Stacks PoX transactions.
   * It supports both mainnet and testnet via an injected `StacksNetwork` instance.
   */
  export class StacksAdapter {
    private network: StacksNetwork;
    private poxContract: { address: string; name: string };
  
    /**
     * @param network - A StacksNetwork instance (e.g. StacksMainnet or StacksTestnet)
     * @param poxContract - PoX contract address and name for the network
     */
    constructor(
      network: StacksNetwork,
      poxContract: { address: string; name: string }
    ) {
      this.network = network;
      this.poxContract = poxContract;
    }
  
    /**
     * Build an unsigned "delegate-stack-stx" contract call transaction.
     * @param delegator - Stacks address delegating STX
     * @param amountUstx - Amount in micro-STX (uSTX)
     */
    async buildDelegateTx(delegator: string, amountUstx: string, publicKey: string) {
      const options: UnsignedContractCallOptions = {
        contractAddress: this.poxContract.address,
        contractName: this.poxContract.name,
        functionName: 'delegate-stack-stx',
        functionArgs: [standardPrincipalCV(delegator), uintCV(amountUstx)],
        network: this.network,
        nonce: 0,
        fee: 0,
        validateWithAbi: false,
        publicKey: '0x' + publicKey,
      };
      return makeUnsignedContractCall(options);
    }
  
    /**
     * Build an unsigned "revoke-delegation" (undelegate) transaction by setting amount=0.
     * @param delegator - Stacks address to undelegate from
     */
    async buildRevokeTx(delegator: string) {
      const options: UnsignedContractCallOptions = {
        contractAddress: this.poxContract.address,
        contractName: this.poxContract.name,
        functionName: 'delegate-stack-stx',
        functionArgs: [standardPrincipalCV(delegator), uintCV('0')],
        network: this.network,
        nonce: 0,
        fee: 0,
        validateWithAbi: false,
        publicKey: '0x00' // Placeholder - should be replaced with actual public key
      };
      return makeUnsignedContractCall(options);
    }
  
    /**
     * Broadcast a signed transaction hex to the network.
     * @param signedTxHex - Signed transaction serialized as hex
     */
    async broadcast(signedTxHex: string): Promise<TxBroadcastResult> {
      const tx = deserializeTransaction(signedTxHex);
      return broadcastTransaction({ transaction: tx });
    }
  }
  
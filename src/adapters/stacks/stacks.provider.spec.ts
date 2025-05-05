import { StacksProvider } from '../../../src/adapters/stacks/stacks.provider';
import { StacksAdapter } from '../../../src/adapters/stacks/stacks.adapter';
import fetch from 'node-fetch';
import BigNumber from 'bignumber.js';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { StacksTransactionWire, TxBroadcastResult } from '@stacks/transactions';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../../../src/adapters/stacks/stacks.adapter');

const { Response } = jest.requireActual('node-fetch');

// Add type for the mocked fetch
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('StacksProvider', () => {
  const pox = { address: 'SP123', name: 'pox' };
  const configTest = { nodeUrl: 'http://testnet', pox };
  const configMain = { nodeUrl: 'https://mainnet', pox };

  let provider: StacksProvider;
  let adapterMock: jest.Mocked<StacksAdapter>;

  beforeEach(async () => {
    // Clear all mocks
    (StacksAdapter as jest.Mock).mockClear();
    mockedFetch.mockClear();
    
    // Create mock adapter instance with required properties
    adapterMock = {
      network: STACKS_TESTNET,
      poxContract: pox,
      buildDelegateTx: jest.fn(),
      buildRevokeTx: jest.fn(),
      broadcast: jest.fn(),
    } as unknown as jest.Mocked<StacksAdapter>;

    // Make StacksAdapter constructor return our mock
    (StacksAdapter as jest.Mock).mockImplementation(() => adapterMock);

    provider = new StacksProvider();
  });

  it('initializes with testnet', async () => {
    await provider.initialize(configTest);
    expect(StacksAdapter).toHaveBeenCalledWith(STACKS_TESTNET, pox);
  });

  it('initializes with mainnet', async () => {
    await provider.initialize(configMain);
    expect(StacksAdapter).toHaveBeenCalledWith(STACKS_MAINNET, pox);
  });

  it('delegate returns unsigned tx hex', async () => {
    await provider.initialize(configTest);
    
    const mockTx = {
      serialize: () => 'cafebabe'
    } as unknown as StacksTransactionWire;
    adapterMock.buildDelegateTx.mockResolvedValue(mockTx);

    const receipt = await provider.delegate('ST1', new BigNumber(1), '', { publicKey: 'cafebabe' });
    expect(receipt.txBytes).toEqual('cafebabe');
  });

  it('queryDelegation parses and builds pendingActions', async () => {
    await provider.initialize(configTest);

    // Mock fetch PoX info
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          total_stx_delegated_u: '2000000',
          pending_btc_rewards_microbtc: '5000',
        }),
        { status: 200 }
      )
    );

    // Mock adapter tx builders
    const mockClaimTx = {
      txid: () => 'aa'
    } as unknown as StacksTransactionWire;
    const mockRevokeTx = {
      txid: () => 'bb'
    } as unknown as StacksTransactionWire;
    
    adapterMock.buildDelegateTx.mockResolvedValue(mockClaimTx);
    adapterMock.buildRevokeTx.mockResolvedValue(mockRevokeTx);

    const info = await provider.queryDelegation('ST1');
    expect(info.totalStaked.toString()).toEqual('2');         // 2 STX
    expect(info.pendingRewards.toString()).toEqual('0.005');  // 5000 microbtc → 0.005 BTC

    expect(info.pendingActions).toHaveLength(2);
    expect(info.pendingActions[0]).toMatchObject({
      type: 'CLAIM_REWARDS',
      passthrough: { unsignedTx: 'aa' },
    });
    expect(info.pendingActions[1]).toMatchObject({
      type: 'UNDELEGATE',
      passthrough: { unsignedTx: 'bb' },
      args: { maxAmount: '2' },
    });
  });

  it('executeAction broadcasts signedTx and returns receipt', async () => {
    await provider.initialize(configTest);
    
    const mockBroadcastResult: TxBroadcastResult = { txid: '0x123' };
    adapterMock.broadcast.mockResolvedValue(mockBroadcastResult);

    const receipt = await provider.executeAction({
      id: '1',
      type: 'CLAIM_REWARDS',
      passthrough: { signedTx: 'dead' },
    });
    
    expect(adapterMock.broadcast).toHaveBeenCalledWith('dead');
    expect(receipt.txid).toEqual('0x123');
    expect(receipt.status).toEqual('pending');
  });
});

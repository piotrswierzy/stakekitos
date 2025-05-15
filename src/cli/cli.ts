import program from 'commander';
import BigNumber from 'bignumber.js';
import { PluginFactory } from '../core/plugins/plugin.factory';
import { OfflineDirectSigner, Registry } from '@cosmjs/proto-signing';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import dotenv from 'dotenv';
import { defaultRegistryTypes, SigningStargateClient } from '@cosmjs/stargate';
import { MsgDelegateDefinition, MsgUndelegateDefinition } from '../adapters/cosmos/cosmos.types';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

// Initialize dotenv
dotenv.config();
const pluginFactory = new PluginFactory();
const rpc = 'https://rpc.dukong.mantrachain.io';
const registry: Registry = new Registry(defaultRegistryTypes);

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
  return DirectSecp256k1HdWallet.fromMnemonic(process.env.TESTNET_COSMOS_MNEMONIC!, {
    prefix: 'mantra',
  });
};

/**
 * WARNING: This file is only for smoke testing purposes and is not functioning properly.
 * It contains incomplete implementations and should not be used in production.
 * The code here needs significant improvements and proper error handling.
 */

program
  .command('cosmos:delegate')
  .requiredOption('-a, --address <addr>')
  .requiredOption('-n, --amount <amt>')
  .action(async opts => {
    const signer = await getAliceSignerFromMnemonic();
    const alice = (await signer.getAccounts())[0];
    const provider = await pluginFactory.getProvider('cosmos');
    console.log(alice);
    const receipt = await provider.delegate(alice.address, new BigNumber(opts.amount), 'mantravaloper1q8mgs55hfgkm7d5rret439997x87s2ek2r83q2', { denom: 'uom' });
    const txBytesToSign = new Uint8Array(Buffer.from(receipt.txBytes, 'hex'));
    const message = registry.decode({
      typeUrl: MsgDelegateDefinition,
      value: txBytesToSign,
    });

    const signingClient = await SigningStargateClient.connectWithSigner(rpc, signer);
    const result = await signingClient.sign(
      alice.address,
      [
        {
          typeUrl: MsgDelegateDefinition,
          value: message,
        },
      ],
      {
        amount: [
          {
            denom: 'uom',
            amount: '3000',
          },
        ],
        gas: '300000',
      },
      ''
    );

    const txBytesSigned = TxRaw.encode(result).finish();
    const txBytesSignedHex = Buffer.from(txBytesSigned).toString('hex');

    const receiptFromProvider = await provider.executeTransaction({
      providerId: 'cosmos',
      transactionDefinition: MsgDelegateDefinition,
      signedTransaction: txBytesSignedHex,
    });
    console.log(receiptFromProvider);
  });

program
  .command('cosmos:undelegate')
  .requiredOption('-a, --address <addr>')
  .requiredOption('-n, --amount <amt>')
  .action(async opts => {
    const signer = await getAliceSignerFromMnemonic();
    const alice = (await signer.getAccounts())[0];
    const provider = await pluginFactory.getProvider('cosmos');
    console.log(alice);
    const receipt = await provider.undelegate(alice.address, new BigNumber(opts.amount), 'mantravaloper1q8mgs55hfgkm7d5rret439997x87s2ek2r83q2', { denom: 'uom' });
    const txBytesToSign = new Uint8Array(Buffer.from(receipt.txBytes, 'hex'));
    const message = registry.decode({
      typeUrl: receipt.transactionDefinition,
      value: txBytesToSign,
    });

    const signingClient = await SigningStargateClient.connectWithSigner(rpc, signer);
    const result = await signingClient.sign(
      alice.address,
      [
        {
          typeUrl: receipt.transactionDefinition,
          value: message,
        },
      ],
      {
        amount: [
          {
            denom: 'uom',
            amount: '3000',
          },
        ],
        gas: '300000',
      },
      ''
    );

    const txBytesSigned = TxRaw.encode(result).finish();
    const txBytesSignedHex = Buffer.from(txBytesSigned).toString('hex');

    const receiptFromProvider = await provider.executeTransaction({
      providerId: 'cosmos',
      transactionDefinition: receipt.transactionDefinition,
      signedTransaction: txBytesSignedHex,
    });
    console.log(receiptFromProvider);
  });

program
  .command('cosmos:query:delegation')
  .requiredOption('-a, --address <addr>')
  .action(async opts => {
    const provider = await pluginFactory.getProvider('cosmos');
    const result = await provider.queryDelegation(opts.address);
    console.log(JSON.stringify(result));
  });

program
  .command('cosmos:claim:rewards')
  .requiredOption('-a, --address <addr>')
  .requiredOption('-v, --validator <val>')
  .action(async opts => {
    const signer = await getAliceSignerFromMnemonic();
    const alice = (await signer.getAccounts())[0];
    const provider = await pluginFactory.getProvider('cosmos');
    console.log(alice);
    const receipt = await provider.claimRewards(alice.address, opts.validator);
    const txBytesToSign = new Uint8Array(Buffer.from(receipt.txBytes, 'hex'));
    const message = registry.decode({
      typeUrl: receipt.transactionDefinition,
      value: txBytesToSign,
    });

    const signingClient = await SigningStargateClient.connectWithSigner(rpc, signer);
    const result = await signingClient.sign(
      alice.address,
      [
        {
          typeUrl: receipt.transactionDefinition,
          value: message,
        },
      ],
      {
        amount: [
          {
            denom: 'uom',
            amount: '3000',
          },
        ],
        gas: '300000',
      },
      ''
    );

    const txBytesSigned = TxRaw.encode(result).finish();
    const txBytesSignedHex = Buffer.from(txBytesSigned).toString('hex');

    const receiptFromProvider = await provider.executeTransaction({
      providerId: 'cosmos',
      transactionDefinition: receipt.transactionDefinition,
      signedTransaction: txBytesSignedHex,
    });
    console.log(receiptFromProvider);
  });

program.parse(process.argv);

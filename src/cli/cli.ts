import program from "commander";
import BigNumber from "bignumber.js";
import { PluginFactory } from "../core/plugins/plugin.factory";
import {
  makeRandomPrivKey,
  publicKeyToAddress,
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { ec as EC } from 'elliptic';

const pluginFactory = new PluginFactory();

/**
 * WARNING: This file is only for smoke testing purposes and is not functioning properly.
 * It contains incomplete implementations and should not be used in production.
 * The code here needs significant improvements and proper error handling.
 */

program
  .command("stake:stacks")
  .requiredOption("-a, --address <addr>")
  .requiredOption("-n, --amount <amt>")
  .action(async opts => {
    const provider = await pluginFactory.getProvider("stacks");
    const receipt = await provider.delegate(opts.address, new BigNumber(opts.amount), '');
    console.log(receipt);
  });

program.parse(process.argv);

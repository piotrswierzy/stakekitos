import program from "commander";
import BigNumber from "bignumber.js";
import { PluginFactory } from "../core/plugins/plugin.factory";
import {
  makeRandomPrivKey,
  publicKeyToAddress,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
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
    
    const privateKey = makeRandomPrivKey();  
    console.log('Private key (hex):', privateKey);
    const secp = new EC('secp256k1');
    const keyPair    = secp.keyFromPrivate(privateKey, 'hex');
    const compressed = keyPair.getPublic(true, 'hex');
    console.log(compressed);
    console.log('Public key (hex):', compressed);
    const mainnetAddr = publicKeyToAddress(compressed, STACKS_MAINNET);
    console.log('Stacks address:', mainnetAddr);
    const provider = await pluginFactory.getProvider("stacks");
    const receipt = await provider.delegate(opts.address, new BigNumber(opts.amount), '', { publicKey: compressed });
    console.log("TX ID:", receipt.txBytes);
  });

program.parse(process.argv);

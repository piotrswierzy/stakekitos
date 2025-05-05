import { Injectable } from '@nestjs/common';
import configs from '../../config/default.json';
import { getProvider } from './plugin.manager';
import { IStakingProvider } from './staking-provider.interface';

@Injectable()
export class PluginFactory {
  async getProvider(chain: string): Promise<IStakingProvider> {
    return getProvider(chain, configs);
  }
}

// src/adapters/stacks/stacks.module.ts

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import stacksConfig from './stacks.config'; 
import { StacksProvider } from './stacks.provider';

@Module({})
export class StacksModule {
  static forRoot(): DynamicModule {
    return {
      module: StacksModule,
      imports: [ConfigModule.forFeature(stacksConfig)],
      providers: [
        {
          provide: StacksProvider,
          useFactory: (cfg: ConfigType<typeof stacksConfig>) => {
            const provider = new StacksProvider();
            // initialize synchronously or await in an async factory
            provider.initialize(cfg);
            return provider;
          },
          inject: [stacksConfig.KEY],
        },
      ],
      exports: [StacksProvider],
    };
  }
}

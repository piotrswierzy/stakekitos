import { Module }         from '@nestjs/common';
import { YieldsController } from './yields.controller';
import { YieldsService }    from './yields.service';
import { PluginFactory }    from '../core/plugins/plugin.factory';
@Module({
  controllers: [YieldsController],
  providers:   [YieldsService, PluginFactory],
})
export class YieldsModule {}

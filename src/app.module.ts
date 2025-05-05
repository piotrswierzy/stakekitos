import { Module }        from '@nestjs/common';
import { ConfigModule }  from '@nestjs/config';
import { YieldsModule }  from './yields/yields.module';
import { StacksModule } from './adapters/stacks/stacks.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => require('./config/default.json')] }),
    StacksModule.forRoot(),
    YieldsModule,
  ],
})
export class AppModule {}

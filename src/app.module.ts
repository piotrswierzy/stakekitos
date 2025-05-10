import { Module }        from '@nestjs/common';
import { ConfigModule }  from '@nestjs/config';
import { YieldsModule }  from './yields/yields.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => require('./config/default.json')] }),
    YieldsModule,
  ],
})
export class AppModule {}

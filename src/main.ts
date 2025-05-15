import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Stakekitos API')
    .setDescription('A modular, blockchain-agnostic staking integration API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT || 3000);
  console.log(`Running on http://localhost:${process.env.PORT||3000}/api`);
}
bootstrap();

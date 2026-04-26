import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DatabaseConfig } from './database.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseConfig>('database');
        const datasource = new DataSource({
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          entities: [],
          // ⚠️ dev only
          synchronize: db.synchronize,
          logging: process.env.NODE_ENV !== 'production',
          // ✅ pool config
          extra: {
            max: 20,
          },
        });
        try {
          await datasource.initialize();
          console.log('database connected');
        } catch (error) {
          console.error('database connection failed', error);
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}

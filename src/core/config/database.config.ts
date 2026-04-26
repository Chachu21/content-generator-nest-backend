import { registerAs } from '@nestjs/config';
export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
};

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'ethiocontentai',
    synchronize:
      process.env.NODE_ENV !== 'production' && process.env.DB_SYNC === 'true',
  }),
);

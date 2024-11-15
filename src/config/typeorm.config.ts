import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = process.env.NODE_ENV;
    console.log('Current environment:', nodeEnv);

    // Base configuration shared between environments
    const baseConfig = {
      autoLoadEntities: true,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      logging: nodeEnv === 'development',
    };

    if (nodeEnv === 'development') {
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) {
        throw new Error(
          'DATABASE_URL is not defined in development environment',
        );
      }

      return {
        ...baseConfig,
        type: 'postgres',
        url: dbUrl,
        synchronize: true,
        ssl: false,
      };
    }

    if (nodeEnv === 'test') {
      return {
        ...baseConfig,
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
      };
    }

    if (nodeEnv === 'production') {
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) {
        throw new Error(
          'DATABASE_URL is not defined in production environment',
        );
      }

      return {
        ...baseConfig,
        type: 'postgres',
        url: dbUrl,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
      };
    }

    throw new Error(`Unsupported NODE_ENV: ${nodeEnv}`);
  }
}

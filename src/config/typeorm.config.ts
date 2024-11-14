import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const synchronize = this.configService.get<string>('SYNCHRONIZE');
    const migrationsRun = this.configService.get<string>('MIGRATIONS_RUN');
    const ssl = this.configService.get<string>('SSL');

    console.log('SYNCHRONIZE:', synchronize);
    console.log('MIGRATIONS_RUN:', migrationsRun);
    console.log('SSL:', ssl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log(this.configService.get<string>('DATABASE_URL'));

    if (process.env.NODE_ENV === 'development') {
      return {
        type: this.configService.get<any>('DB_TYPE') || 'postgres',
        url: this.configService.get<string>('DATABASE_URL'),
        synchronize: synchronize ? JSON.parse(synchronize) : false,
        autoLoadEntities: true,
        migrationsRun: migrationsRun ? JSON.parse(migrationsRun) : true,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      };
    } else if (process.env.NODE_ENV === 'test') {
      return {
        type: this.configService.get<any>('DB_TYPE'),
        synchronize: synchronize ? JSON.parse(synchronize) : false,
        database: this.configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        migrationsRun: migrationsRun ? JSON.parse(migrationsRun) : false,
      };
    } else if (process.env.NODE_ENV === 'production') {
      return {
        type: this.configService.get<any>('DB_TYPE') || 'postgres',
        url: this.configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: synchronize ? JSON.parse(synchronize) : false,
        migrationsRun: migrationsRun ? JSON.parse(migrationsRun) : false,
        ssl: ssl && JSON.parse(ssl) ? { rejectUnauthorized: false } : false,
      };
    }
  }
}

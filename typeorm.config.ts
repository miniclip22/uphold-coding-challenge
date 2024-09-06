// src/app/api/bot/config/typeorm.config.ts
import { DataSource } from 'typeorm';
import { MonitoringData } from '../entities/MonitoringData';
import { Alert } from '../entities/Alert';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: './data/bot-database.db',
    synchronize: true,
    logging: false,
    entities: [MonitoringData, Alert],
    migrations: [],
    subscribers: [],
});

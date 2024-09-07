import { PrismaClient } from '@prisma/client';
import {startMonitoring, stopMonitoring, lastAlertRates, checkPrice} from '@/app/api/bot/utils/helper';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const prisma = new PrismaClient();

describe('Data Integrity During Concurrent Monitoring', () => {
    beforeAll(async () => {
        // Set up the database connection
        await prisma.$connect();
    });

    afterAll(async () => {
        // Clean up the database connection
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.alert.deleteMany();
        await prisma.interval.deleteMany();
        await prisma.botConfig.deleteMany();
        Object.keys(lastAlertRates).forEach(key => delete lastAlertRates[key]);

    });

    it('should correctly handle multiple currency pairs without data corruption', async () => {
        const currencyPairs: string[] = ['BTC-USD', 'ETH-USD', 'LTC-USD'];
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs,
                fetchInterval: 10000,
                alertThreshold: 0.05, // 5% threshold
            },
        });

        // Start monitoring
        await startMonitoring(currencyPairs, 10000, 0.05);

        lastAlertRates['BTC-USD'] = 50000; // Set initial rate for BTC-USD
        lastAlertRates['ETH-USD'] = 3000;  // Set initial rate for ETH-USD
        lastAlertRates['LTC-USD'] = 200;   // Set initial rate for LTC-USD

        // Simulate price check with increased rates
        await checkPrice('BTC-USD', 0.05, botConfig.id); // Simulate BTC-USD
        await checkPrice('ETH-USD', 0.05, botConfig.id); // Simulate ETH-USD
        await checkPrice('LTC-USD', 0.05, botConfig.id); // Simulate LTC-USD

        // Check if alerts were correctly triggered and stored for each currency pair
        const btcAlert = await prisma.alert.findMany({
            where: {
                pair: 'BTC-USD',
                botConfigId: botConfig.id,
            },
        });

        const ethAlert = await prisma.alert.findMany({
            where: {
                pair: 'ETH-USD',
                botConfigId: botConfig.id,
            },
        });

        const ltcAlert = await prisma.alert.findMany({
            where: {
                pair: 'LTC-USD',
                botConfigId: botConfig.id,
            },
        });

        // Ensure that one alert was triggered for each currency pair
        expect(btcAlert.length).toBe(1);
        expect(ethAlert.length).toBe(1);
        expect(ltcAlert.length).toBe(1);

        // Further checks can ensure that each alert corresponds to the expected rate changes
        expect(btcAlert[0].rateChange).toBeGreaterThan(0.05);
        expect(ethAlert[0].rateChange).toBeGreaterThan(0.05);
        expect(ltcAlert[0].rateChange).toBeGreaterThan(0.05);

        // Stop monitoring after the test
        await stopMonitoring();
    });
});

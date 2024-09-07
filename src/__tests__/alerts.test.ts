import { PrismaClient } from '@prisma/client';
import { checkPrice, lastAlertRates } from '@/app/api/bot/utils/helper';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const prisma = new PrismaClient();

describe('Alert Triggering', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clear data before each test
        await prisma.alert.deleteMany();
        await prisma.interval.deleteMany();
        await prisma.botConfig.deleteMany();
        Object.keys(lastAlertRates).forEach(key => delete lastAlertRates[key]);
    });

    it('should trigger an alert if the price change exceeds the threshold', async () => {
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD'],
                fetchInterval: 10000,
                alertThreshold: 0.01,
            },
        });

        if (!botConfig || !botConfig.id) {
            throw new Error('Bot configuration was not created successfully.');
        }

        lastAlertRates['BTC-USD'] = 50000; // Set initial rate in the dynamic object
        await checkPrice('BTC-USD', 0.01, botConfig.id); // Simulate price check with an increased rate


        const alerts = await prisma.alert.findMany({
            where: {
                pair: 'BTC-USD',
                botConfigId: botConfig.id,
            },
        });

        expect(alerts.length).toBe(1);
        expect(alerts[0].rateChange).toBeGreaterThan(0.01);
    });

    it('should not trigger an alert if the price change is below the threshold', async () => {
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD'],
                fetchInterval: 10000,
                alertThreshold: 0.1,
            },
        });

        lastAlertRates['BTC-USD'] = 50000;
        await checkPrice('BTC-USD', 0.1, botConfig.id);

        const alerts = await prisma.alert.findMany({
            where: {
                pair: 'BTC-USD',
                botConfigId: botConfig.id,
            },
        });

        expect(alerts.length).toBe(0);
    });
});

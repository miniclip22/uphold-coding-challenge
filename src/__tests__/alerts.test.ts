import {PrismaClient} from '@prisma/client';
import {checkPrice, lastAlertRates} from '@/app/api/bot/utils/helper';

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
        // Step 1: Insert initial bot configuration
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD'],
                fetchInterval: 10000,
                alertThreshold: 0.01,
            },
        });

        // Step 2: Simulate a price change that exceeds the threshold
        lastAlertRates['BTC-USD'] = 50000; // Set initial rate in the dynamic object
        await checkPrice('BTC-USD', 0.01, botConfig.id); // Simulate price check with an increased rate

        // Step 3: Check if an alert was triggered
        const alerts = await prisma.alert.findMany({
            where: {
                pair: 'BTC-USD',
                botConfigId: botConfig.id,
            },
        });

        expect(alerts.length).toBe(1); // Expect 1 alert since one should be triggered after the checkPrice call
        expect(alerts[0].rateChange).toBeGreaterThan(0.01); // Ensure the alert corresponds to the correct rate change
    });

    it('should not trigger an alert if the price change is below the threshold', async () => {
        // Step 1: Insert initial bot configuration
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD'],
                fetchInterval: 10000,
                alertThreshold: 0.1,
            },
        });

        // Step 2: Simulate a price change that is below the threshold
        lastAlertRates['BTC-USD'] = 50000; // Set initial rate in the dynamic object
        await checkPrice('BTC-USD', 0.1, botConfig.id); // Simulate price check with a rate change below threshold

        // Step 3: Check if no alert was triggered
        const alerts = await prisma.alert.findMany({
            where: {
                pair: 'BTC-USD',
                botConfigId: botConfig.id,
            },
        });

        expect(alerts.length).toBe(0); // Expect no alerts to be triggered
    });
});

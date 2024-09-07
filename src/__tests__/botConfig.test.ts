import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const prisma = new PrismaClient();

describe('BotConfig Insertion', () => {
    beforeAll(async () => {
        // Set up the database connection
        await prisma.$connect();
    });

    afterAll(async () => {
        // Clean up the database connection
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clear data before each test
        await prisma.botConfig.deleteMany();
    });

    it('should correctly insert a BotConfig into the database', async () => {
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD', 'ETH-USD'],
                fetchInterval: 5000,
                alertThreshold: 0.01,
            },
        });

        const retrievedConfig = await prisma.botConfig.findUnique({
            where: {
                id: botConfig.id,
            },
        });

        expect(retrievedConfig).toBeTruthy();
        expect(retrievedConfig?.currencyPairs).toEqual(['BTC-USD', 'ETH-USD']);
        expect(retrievedConfig?.fetchInterval).toBe(5000);
        expect(retrievedConfig?.alertThreshold).toBe(0.01);
    });
});

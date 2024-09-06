import { PrismaClient } from '@prisma/client';

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
        // Step 1: Insert a bot configuration
        const botConfig = await prisma.botConfig.create({
            data: {
                currencyPairs: ['BTC-USD', 'ETH-USD'],
                fetchInterval: 5000,
                alertThreshold: 0.01,
            },
        });

        // Step 2: Retrieve the inserted bot configuration
        const retrievedConfig = await prisma.botConfig.findUnique({
            where: {
                id: botConfig.id,
            },
        });

        // Step 3: Verify that the retrieved configuration matches the inserted data
        expect(retrievedConfig).toBeTruthy();
        expect(retrievedConfig?.currencyPairs).toEqual(['BTC-USD', 'ETH-USD']);
        expect(retrievedConfig?.fetchInterval).toBe(5000);
        expect(retrievedConfig?.alertThreshold).toBe(0.01);
    });
});

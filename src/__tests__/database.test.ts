import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

describe('Database Setup and Teardown', () => {
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = new PrismaClient();
        await prisma.$connect();
    });

    afterAll(async () => {
        // Close database connection and clean up
        await prisma.$disconnect();
    });

    it('should connect to the postgreSQL database', async () => {
        // Test to verify the connection to the database
        const result = await prisma.$queryRaw`SELECT 1`; // A simple query to verify connection
        expect(result).toBeTruthy(); // Check that the connection was successful
    });
});

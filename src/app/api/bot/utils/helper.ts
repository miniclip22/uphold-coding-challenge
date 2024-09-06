import axios from 'axios';
import prisma from '@/prismaClient';  // import the Prisma client
import { config } from '@/bot/config/config';
import { monitoringState } from "@/app/api/bot/utils/monitoringState";

export const lastAlertRates: { [currencyPair: string]: number | null } = {};

export const startMonitoring = async (
    currencyPairs = config.currencyPairs,
    fetchInterval = config.fetchInterval,
    alertThreshold = config.alertThreshold
) => {
    if (currencyPairs.length === 0) {
        console.log('No currency pairs provided for monitoring.');
        return;
    }

    // Create the bot configuration in the database
    const botConfig = await prisma.botConfig.create({
        data: {
            currencyPairs,
            fetchInterval,
            alertThreshold,
        },
    });

    for (const pair of currencyPairs) {
        const interval = setInterval(() => checkPrice(pair, alertThreshold, botConfig.id), fetchInterval);

        // Convert intervalId to a number (or use the timeout object directly if you prefer)
        const intervalId = Number(interval);

        // Save each interval in the Interval model with the associated botConfigId
        await prisma.interval.create({
            data: {
                intervalId,  // Store the interval ID as a number
                botConfigId: botConfig.id,  // Use the correct botConfig.id
            },
        });

        console.log(`Started monitoring for ${pair}, interval ID: ${intervalId}`);
    }
};

export const checkPrice = async (currencyPair: string, alertThreshold: number, botConfigId: number) => {
    try {
        const response = await axios.get(`${config.apiUrl}${currencyPair}`);
        const currentRate: number = parseFloat(response.data.ask);

        console.log(`Current ${currencyPair} Rate: ${currentRate}`);

        const previousRate: number | null | undefined = lastAlertRates[currencyPair];

        if (previousRate === undefined || previousRate === null) {
            console.log(`Initializing last alert rate for ${currencyPair}.`);
            lastAlertRates[currencyPair] = currentRate;
        } else {
            const rateChange = Math.abs((currentRate - previousRate) / previousRate);
            console.log(`Rate Change: ${rateChange.toFixed(4)}`);

            if (!isNaN(rateChange) && rateChange >= alertThreshold) {
                console.log(`Alert: ${currencyPair} price changed by ${(rateChange * 100).toFixed(4)}% to ${currentRate}`);
                await prisma.alert.create({
                    data: {
                        pair: currencyPair,
                        rateChange,
                        botConfigId,
                    },
                });
            }

            lastAlertRates[currencyPair] = currentRate;
        }

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error fetching the ${currencyPair} rate:`, error.message);
        } else {
            console.error(`Unexpected error for ${currencyPair}:`, error);
        }
    }
};

export const stopMonitoring = async () => {
    // Retrieve all intervals from the database and clear them
    const intervals = await prisma.interval.findMany();

    if (intervals.length > 0) {
        for (const interval of intervals) {
            clearInterval(interval.intervalId);
            await prisma.interval.delete({where: {id: interval.id}}); // Delete interval after clearing
        }
        console.log('Monitoring stopped');
        monitoringState.monitoringStarted = false; // Reset the flag
    } else {
        console.log('No active monitoring to stop.');
    }
};

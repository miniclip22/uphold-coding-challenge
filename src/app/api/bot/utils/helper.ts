import axios from 'axios';
import {config} from '@/bot/config/config';

// This array will store the intervals for each currency pair monitoring
let intervals: NodeJS.Timeout[] = [];

// This object will hold the last alert rate for each currency pair
const lastAlertRates: { [currencyPair: string]: number | null } = {};

export const startMonitoring = (currencyPairs = config.currencyPairs, fetchInterval = config.fetchInterval, alertThreshold = config.alertThreshold) => {
    if (currencyPairs.length === 0) {
        console.log('No currency pairs provided for monitoring.');
        return;
    }

    currencyPairs.forEach((pair) => {
        const interval = setInterval(() => checkPrice(pair, alertThreshold), fetchInterval);
        intervals.push(interval);
        console.log(`Started monitoring for ${pair}, interval ID: ${interval}`);
    });
};

export const checkPrice = async (currencyPair: string, alertThreshold: number) => {
    try {
        const response = await axios.get(`${config.apiUrl}${currencyPair}`);
        const currentRate: number = parseFloat(response.data.ask);

        console.log(`Current ${currencyPair} Rate: ${currentRate}`);

        const previousRate = lastAlertRates[currencyPair];

        if (previousRate === null) {
            console.log(`Initializing last alert rate for ${currencyPair}.`);
            lastAlertRates[currencyPair] = currentRate;
            return; // Skip calculation for the first run
        }

        const rateChange: number = Math.abs((currentRate - previousRate) / previousRate);
        console.error(`Rate Change: ${rateChange}`);

        if (!isNaN(rateChange) && rateChange >= alertThreshold) {
            console.log(`Alert: ${currencyPair} price changed by ${(rateChange * 100).toFixed(4)}% to ${currentRate}`);
        }

        lastAlertRates[currencyPair] = currentRate;

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error fetching the ${currencyPair} rate:`, error.message);
        } else {
            console.error(`Unexpected error for ${currencyPair}:`, error);
        }
    }
};

export const stopMonitoring = () => {
    if (intervals.length > 0) {
        intervals.forEach(clearInterval);
        intervals = [];
        console.log('Monitoring stopped');
    } else {
        console.log('No active monitoring to stop.');
    }
};

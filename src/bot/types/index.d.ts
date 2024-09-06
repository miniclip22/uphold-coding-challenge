export interface BotConfig {
    currencyPair: string;
    fetchInterval: number;
    alertThreshold: number;
}

export interface PriceData {
    ask: string;
    bid: string;
    currency: string;
}

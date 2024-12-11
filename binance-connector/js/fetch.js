'use strict';

/** Packages */
const binance = require('binance');
const path = require('path');

/** Scripts, variables */
const cwd = process.cwd();
const argv = process.argv.slice(2);
const csvPath = argv[0] ? path.join(cwd, argv[0]) : path.join(cwd, 'binance-connector/ignore');
const symbol = require('./config/symbol.json');
const key = require('./config/credentials.json');
const Klines = require('./models/klines');
const CSV = require('./scripts/csv');

if (!key || !key.apiKey || !key.secretKey) {
    throw new Error('Key not found');
}

const execute = async () => {
    const client = new binance.USDMClient({
        api_key: key.apiKey,
        api_secret: key.secretKey
    });

    // https://developers.binance.com/docs/binance-spot-api-docs/rest-api/public-api-endpoints#klinecandlestick-data
    const params = {
        symbol: symbol.BTC,
        interval: '5m'
    };
    const klineData = await client.getKlines(params).catch(error => {
        console.error(error);
    });

    if (klineData) {
        const csvFileName = `binance_${params.symbol}_${params.interval}.csv`;

        /** @type {Array} */
        const klines = new Klines(klineData);
        const csv = new CSV({
            path: csvPath,
            fileName: csvFileName
        });

        csv.writeHeader([
            'Symbol',
            'Open Time',
            'Close Time',
            'Open Price',
            'High Price',
            'Low Price',
            'Close Price',
            'Volume',
            'Type'
        ]);

        klines.forEach(item => {
            csv.writeRow([
                params.symbol,
                item.openTime,
                item.closeTime,
                item.openPrice,
                item.highPrice,
                item.lowPrice,
                item.closePrice,
                item.volume,
                item.type
            ]);
        });

        csv.export();
    }
};

execute();

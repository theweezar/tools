'use strict';

/** Packages */
const binance = require('binance');
const path = require('path');

/** Scripts, variables */
const cwd = process.cwd();
const keyPath = path.join(cwd, 'ignore/binance_connector_key.json');
const csvPath = path.join(cwd, 'ignore/binance');
const symbol = require('./config/symbol.json');
const Klines = require('./models/klines');
const CSV = require('./scripts/csv');
let key;

/** Try to get key */
try {
    key = require(keyPath);
    if (!key || !key.apiKey || !key.secretKey) {
        throw new Error('Key not found');
    }
} catch (error) {
    process.exit(1);
}

const execute = async () => {
    const client = new binance.USDMClient({
        api_key: key.apiKey,
        api_secret: key.secretKey,
        limit: 1000
    });

    // https://developers.binance.com/docs/binance-spot-api-docs/rest-api/public-api-endpoints#klinecandlestick-data
    const params = {
        symbol: symbol.XRP,
        interval: '15m'
    };
    const klineData = await client.getKlines(params).catch(error => {
        console.error(error);
    });

    if (klineData) {
        const csvFileName = `binance_${params.symbol.toLocaleLowerCase()}.csv`;

        /** @type {Array} */
        const klines = new Klines(klineData);
        const csv = new CSV({
            path: csvPath,
            fileName: csvFileName
        });

        csv.writeHeader([
            'Open Time',
            'Close Time',
            'Open Price',
            'High Price',
            'Low Price',
            'Close Price',
            'Volume'
        ]);

        klines.forEach(item => {
            csv.writeRow([
                item.openTime,
                item.closeTime,
                item.openPrice,
                item.highPrice,
                item.lowPrice,
                item.closePrice,
                item.volume
            ]);
        });

        csv.export();
    }
};

execute();

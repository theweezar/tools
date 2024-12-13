'use strict';

/** Packages */
const binance = require('binance');
const path = require('path');
const shell = require('shelljs');
const program = require('commander');

/** Scripts, variables */
const symbol = require('./config/symbol.json');
const key = require('./config/credentials.json');
const Klines = require('./models/klines');
const CSV = require('./scripts/csv');

/** Check credentials */
if (!key || !key.apiKey || !key.secretKey) {
    throw new Error('Key not found');
}

/** Create prompt for script */
program.version('0.1.0')
    .option('-D, --deleteBeforeExport', 'Delete all exported files in the past before exporting new files')
    .option('-p, --path [csv path]', 'Configure csv folder path', '../ignore')
    .option('-s, --symbol [type]', 'Configure coin symbol', symbol.BTC)
    .option('-i, --interval [type]', 'Configure chart interval', '5m')
    .option('-f, --frame [type]', 'Configure how many frame to loop', 1)
    .parse(process.argv);

const cwd = process.cwd();
const csvDirPath = path.join(cwd, program.path);
const frameCount = Number(program.frame);
const LIMIT = 500;
const timeSlots = (() => {
    const slots = [];
    const intervalMS = {
        '1m': 60000,
        '3m': 180000,
        '5m': 300000,
        '15m': 300000 * 3,
        '30m': 300000 * 6,
        '1h': 900000 * 4,
    };
    const range = intervalMS[program.interval] * LIMIT;
    let end = (new Date()).getTime();

    for (let i = 0; i < frameCount; i++) {
        let start = end - range;
        slots.push({
            startTime: start,
            endTime: end
        });
        end = start;
    }

    return slots;
})();

const sleep = async (milliseconds) => {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

const execute = async () => {
    const client = new binance.USDMClient({
        api_key: key.apiKey,
        api_secret: key.secretKey
    });

    const mainKlineModel = new Klines();
    const params = {
        symbol: program.symbol,
        interval: program.interval
    };

    for (let idx = 0; idx < frameCount; idx++) {
        const slot = timeSlots[idx];

        if (frameCount > 1) {
            params.startTime = slot.startTime;
            params.endTime = slot.endTime;
        }

        // https://developers.binance.com/docs/binance-spot-api-docs/rest-api/public-api-endpoints#klinecandlestick-data
        const klineData = await client.getKlines(params).catch(error => {
            console.error(error);
        });

        if (klineData) {
            const klines = new Klines(klineData);
            mainKlineModel.unshift(klines);
        }

        await sleep(250);
    }

    const csvFileName = `binance_${params.symbol}_${params.interval}.csv`;
    const csv = new CSV({
        path: csvDirPath,
        fileName: csvFileName
    });

    csv.writeHeader([
        'Symbol',
        'Open Time',
        'Close Time',
        'Open',
        'High',
        'Low',
        'Close',
        'Volume',
        'Type'
    ]);

    mainKlineModel.export().forEach(item => {
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

    if (program.deleteBeforeExport) {
        shell.ls(`${csvDirPath}/*.csv`).forEach(function (file) {
            shell.rm('-f', file);
        });
    }

    csv.export();
};

execute();

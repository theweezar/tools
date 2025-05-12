'use strict';

const path = require('path');
const fs = require('fs');
const converter = require('json-2-csv');
const cwd = process.cwd();
const csvPath = path.join(cwd, 'ignore', 'sskr', '20250512_staging_kr-samsonite-products.csv');
const jsonPath = path.join(cwd, 'ignore', 'sskr', '20250512_staging_kr-samsonite-products.json');

const csv = fs.readFileSync(csvPath, {
    encoding: 'utf8'
});

const jsonArray = converter.csv2json(csv, {
    trimHeaderFields: true,
    trimFieldValues: true
});

const pageIDsObj = {};

jsonArray.forEach((item) => {
    const split = item.ID.split('-');
    const pageID = split[1] + 'XXXX';

    if (!pageIDsObj[pageID]) {
        pageIDsObj[pageID] = {};
        pageIDsObj[pageID].pageID = pageID;
        pageIDsObj[pageID].pids = [];
        pageIDsObj[pageID].review = null;
    }

    pageIDsObj[pageID].pids.push(item.ID);
});

console.log('Exported pageIDsObj:', Object.keys(pageIDsObj).length);

// const pageIDArray = Object.keys(pageIDsObj).map((key) => {
//     return pageIDsObj[key];
// });

fs.writeFileSync(jsonPath, JSON.stringify(pageIDsObj, null, 4), {
    encoding: 'utf8'
});

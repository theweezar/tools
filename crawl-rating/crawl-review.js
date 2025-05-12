'use strict';

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cwd = process.cwd();
const scriptName = path.basename(__filename);
const config = require('./config.json');
const _config = config[scriptName];
const pageIDsObj = require(path.join(cwd, _config.baseJsonPath));
const outputJsonPath = path.join(cwd, _config.outputJsonPath);
const baseUrl = _config.baseUrl;
const pageIDArray = Object.keys(pageIDsObj);

let successCount = 0;
let errorCount = 0;

async function fetchData(idx) {
    const pageID = pageIDArray[idx];
    const apiUrl = baseUrl.replace(/{{pageID}}/, pageID);

    if (pageIDsObj[pageID].review === null) {
        try {
            const response = await axios.get(apiUrl);
            const result = response.data.results[0];
            const rollup = result.rollup;
            const reviewObj = {
                rating_count: rollup.rating_count,
                review_count: rollup.review_count,
                average_rating: rollup.average_rating,
                native_review_count: rollup.native_review_count,
                syndicated_review_count: rollup.syndicated_review_count
            }
            pageIDsObj[pageID].review = reviewObj;
            successCount++;
            console.log(`Fetched data for ${pageID}`);
        } catch (error) {
            pageIDsObj[pageID].review = null;
            errorCount++;
            console.error(`Error fetching data for ${pageID}`);
        }
    }
}

function saveData() {
    fs.writeFileSync(outputJsonPath, JSON.stringify(pageIDsObj, null, 4));
    console.log('Data saved successfully!');
    console.log(`Success count: ${successCount}`);
    console.log(`Error count: ${errorCount}`);
}

(async () => {
    for (let idx = 0; idx < pageIDArray.length; idx++) {
        await fetchData(idx);
    }
    saveData();
})();

'use strict';

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cwd = process.cwd();
const pageIDsObj = require('../ignore/sskr/20250512_staging_kr-samsonite-products.json');
const pageIDsJsonPath = path.join(cwd, 'ignore', 'sskr', '20250512_staging_kr-samsonite-products_fetched_ko-KR.json');

// en_TH
// const baseUrl = `https://display.powerreviews.com/m/320426/l/en_US/product/{{pageID}}/reviews?apikey=b3e955d9-8bd2-4396-8896-71a32b6e0d2e&_noconfig=true`;
// th_TH
// const baseUrl = `https://display.powerreviews.com/m/97665/l/all/product/{{pageID}}/reviews?apikey=b3e955d9-8bd2-4396-8896-71a32b6e0d2e&_noconfig=true&page_locale=th_TH`;
const baseUrl = `https://display.powerreviews.com/m/1386600694/l/all/product/{{pageID}}/reviews?apikey=57dcbb38-e895-45d8-aa32-4c6f17f87148&_noconfig=true&page_locale=ko_KR`;

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
    fs.writeFileSync(pageIDsJsonPath, JSON.stringify(pageIDsObj, null, 4));
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

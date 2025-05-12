'use strict';

const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const sftpPageIDs = require('../sftp-pageids-array.json');
const fetchedJson = require('../20250416_stg_catalog_Samsonites_fetched.json');
const missingPageIDs = [];
const pageIDsJsonPath = path.join(cwd, '20250416_stg_catalog_Samsonites_fetched.json');

sftpPageIDs.forEach((sftpPageID) => {
    if (!fetchedJson[sftpPageID]) {
        missingPageIDs.push(sftpPageID);
    }
});

console.log('Fetched JSON keys length:', Object.keys(fetchedJson).length);
console.log('Missing pageIDs length:', missingPageIDs.length);
console.log('Missing pageIDs:', missingPageIDs);

missingPageIDs.forEach((missingPageID) => {
    fetchedJson[missingPageID] = {
        pids: [],
        review: null
    };
});

if (missingPageIDs.length) {
    fs.writeFileSync(pageIDsJsonPath, JSON.stringify(fetchedJson, null, 4));
    console.log('Updated Fetched JSON with missing pageIDs.');
}


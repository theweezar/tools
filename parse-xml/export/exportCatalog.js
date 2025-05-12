'use strict';

const path = require('path');
const fs = require('fs');
const helpers = require('../helpers/helpers');
const cwd = process.cwd();

const categoryIdsToKeep = [
    'root',
    'luggage-size-cabin',
    'luggage-size-medium',
    'luggage-size-large',
    'luggage-mono',
    'luggage-cool',
    'luggage-warm',
    'backpack-mono',
    'backpack-cool',
    'backpack-warm',
    'bag-mono',
    'bag-cool',
    'bag-warm',
    'accessories-mono',
    'accessories-cool',
    'accessories-warm'
];

function remove(obj, prop) {
    if (Object.hasOwnProperty.call(obj, prop)) {
        delete obj[prop];
    }
}

async function main() {
    const catalog = 'hk-samsonite';
    const base = 'sfcc/webdav/SE20-594_staging_backup_configs';
    const xmlFilePath = path.join(cwd, `${base}/catalogs/${catalog}/catalog.xml`);
    const outXmlFilePath = path.join(cwd, `${base}/catalogs/${catalog}`, `20250512_SE20-594_filtered_catalog_${catalog}.xml`);
    const fullXmlObj = await helpers.xmlToJSON(xmlFilePath);

    remove(fullXmlObj.catalog, 'header');
    remove(fullXmlObj.catalog, 'category-assignment');
    remove(fullXmlObj.catalog, 'product');

    const categories = fullXmlObj.catalog.category;

    if (!Array.isArray(categories)) {
        console.log('Categories is not an array:', categories);
        return;
    }

    const filteredCategories = categories.filter(category => {
        let categoryId = category.$['category-id'];

        if (categoryId === 'root') {
            Object.keys(category).forEach(key => {
                if (!['$', 'refinement-definitions'].includes(key)) {
                    delete category[key];
                }
            });
            return true;
        }

        return categoryIdsToKeep.includes(categoryId);
    });

    fullXmlObj.catalog.category = filteredCategories;

    const finalXml = helpers.buildXML(fullXmlObj);

    fs.writeFileSync(outXmlFilePath, finalXml);
}

main();

'use strict';

const path = require('path');
const fs = require('fs');
const helpers = require('../helpers/helpers');
const object = require('../lib/object');
const cwd = process.cwd();

function remove(obj, prop) {
    if (Object.hasOwnProperty.call(obj, prop)) {
        delete obj[prop];
    }
}

async function main() {
    const catalog = 'kr-samsonite';
    const xmlFilePath = path.join(cwd, `sfcc/webdav/SE20-594_dev_configs/catalogs/${catalog}/catalog.xml`);
    const outXmlFilePath = path.join(cwd, `sfcc/webdav/SE20-594_dev_configs/catalogs/${catalog}`, `20250512_SE20-594_filtered_catalog_${catalog}.xml`);
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
        let status = processCategory(category);
        if (status) {
            Object.keys(category).forEach(key => {
                if (!['$', 'custom-attributes', 'refinement-definitions'].includes(key)) {
                    delete category[key];
                }
            });
        }
        return status;
    });

    fullXmlObj.catalog.category = filteredCategories;

    const finalXml = helpers.buildXML(fullXmlObj);

    fs.writeFileSync(outXmlFilePath, finalXml);
}

function processCategory(category) {
    let customAttrs = object.resolve(category, 'custom-attributes.0.custom-attribute');
    let categoryId = category.$['category-id'];

    if (categoryId === 'root') {
        return true;
    }

    let urls = [
        `$url('Search-Show', 'cgid', 'luggage')$`,
        `$url('Search-Show', 'cgid', 'backpack')$`,
        `$url('Search-Show', 'cgid', 'bag')$`,
        `$url('Search-Show', 'cgid', 'accessories')$`
    ];

    if (Array.isArray(customAttrs)) {
        customAttrs = customAttrs.filter(attr => {
            let matchAttr = attr.$ && attr.$['attribute-id'] === 'alternativeUrl';
            if (!matchAttr) {
                return false;
            }
            let matchVal = attr._ && urls.some(url => {
                return attr._.includes(url);
            });
            return matchVal;
        });
        object.set(category, 'custom-attributes.0.custom-attribute', customAttrs);
    }

    if (Array.isArray(customAttrs) && customAttrs.length > 0) {
        return true;
    }

    return false;
}

main();

'use strict';

const path = require('path');
const helpers = require('../helpers/helpers');
const object = require('../lib/object');
const cwd = process.cwd();

// Read and parse the XML file synchronously

async function main() {
    const xmlFilePath = path.join(cwd, 'sfcc/webdav/20250505_SE20-594_configs/catalogs/hk-samsonite/catalog.xml');
    const outXmlFilePath = path.join(cwd, 'ignore', 'catalog', 'filtered_catalog.xml');
    const fullXmlObj = await helpers.xmlToJSON(xmlFilePath);

    delete fullXmlObj.catalog['header'];
    delete fullXmlObj.catalog['category-assignment'];

    const categories = fullXmlObj.catalog.category;

    if (!Array.isArray(categories)) {
        console.log('Categories is not an array:', categories);
        return;
    }

    console.log('Categories:', categories.length);

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
    helpers.exportXml(outXmlFilePath, finalXml, null);
}

function processCategory(category) {
    let refDefs = category['refinement-definitions'];
    let customAttrs = object.resolve(category, 'custom-attributes.0.custom-attribute');
    let urls = [
        `$url('Search-Show', 'cgid', 'luggage')$`,
        `$url('Search-Show', 'cgid', 'backpack')$`,
        `$url('Search-Show', 'cgid', 'bag')$`,
        `$url('Search-Show', 'cgid', 'accessories')$`
    ];

    if (Array.isArray(customAttrs)) {
        customAttrs = customAttrs.filter(attr => {
            let matchAttr = attr.$ && attr.$['attribute-id'] === 'alternativeUrl';
            let matchVal = attr._ && urls.some(url => {
                return attr._.includes(url);
            });
            return matchAttr && matchVal;
        });
        object.set(category, 'custom-attributes.0.custom-attribute', customAttrs);
    }

    if (refDefs
        || (Array.isArray(customAttrs) && customAttrs.length > 0)) {
        return true;
    }

    return false;
}

main();

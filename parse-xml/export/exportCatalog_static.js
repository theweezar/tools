'use strict';

const path = require('path');
const fs = require('fs');
const helpers = require('../helpers/helpers');
const object = require('../lib/object');
const cwd = process.cwd();

/**
 * Removes fields from the given object except for the specified keys.
 * @param {Object} obj - The object to be modified
 */
function removeFields(obj) {
    Object.keys(obj).forEach(key => {
        const keyToKeep = ['$', 'custom-attributes', 'refinement-definitions'];
        if (!keyToKeep.includes(key)) {
            object.remove(obj, key);
        }
    });
}

async function main() {
    const catalog = 'kr-samsonite';
    const xmlFilePath = path.join(cwd, `sfcc/webdav/SE20-594_dev_configs/catalogs/${catalog}/catalog.xml`);
    const outXmlFilePath = path.join(cwd, `sfcc/webdav/SE20-594_dev_configs/catalogs/${catalog}`, `20250518_SE20-594_filtered_catalog_${catalog}.xml`);
    const fullXmlObj = await helpers.xmlToJSON(xmlFilePath);

    object.remove(fullXmlObj.catalog, 'header');
    object.remove(fullXmlObj.catalog, 'category-assignment');
    object.remove(fullXmlObj.catalog, 'product');

    const categories = fullXmlObj.catalog.category;

    const filteredCategories = categories.filter(category => {
        let status = processCategory(category);
        if (status) removeFields(category);
        return status;
    });

    console.log('Filtered categories:', filteredCategories.length);

    fullXmlObj.catalog.category = filteredCategories;
    const finalXml = helpers.buildXML(fullXmlObj);
    fs.writeFileSync(outXmlFilePath, finalXml);
}


function processCategory(category) {
    let customAttrs = object.resolve(category, 'custom-attributes.0.custom-attribute');
    let categoryId = object.resolve(category, '$.category-id');

    if (categoryId === 'root') return true;

    // let urls = [
    //     `$url('Search-Show', 'cgid', 'luggage')$`,
    //     `$url('Search-Show', 'cgid', 'backpack')$`,
    //     `$url('Search-Show', 'cgid', 'bag')$`,
    //     `$url('Search-Show', 'cgid', 'accessories')$`
    // ];

    let re = /\$url\('Search-Show', 'cgid', '(luggage|backpack|bag|accessories)'\)\$(\S+)/g;

    if (Array.isArray(customAttrs)) {
        customAttrs = customAttrs.filter(attr => {
            let matchAttr = object.resolve(attr, '$.attribute-id') === 'alternativeUrl';
            // return matchAttr && attr._ && urls.some(url => {
            //     return attr._.includes(url);
            // });
            return matchAttr && attr._ && re.test(attr._);
        });

        object.set(category, 'custom-attributes.0.custom-attribute', customAttrs);

        if (customAttrs.length > 0) return true;
    }

    return false;
}

main();

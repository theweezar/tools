'use strict';

const fs = require('fs');
const xml2js = require('xml2js');

// Read config JSON synchronously
const config = require('../xml_config.json');

// Function to recursively filter XML according to config
function filterXmlByConfig(obj, config) {
    if (!config || typeof obj !== 'object') return;

    for (const key in obj) {
        if (config[key]) {
            const configValue = config[key];

            if (typeof configValue === 'object' && !Array.isArray(obj[key])) {
                const attributeSelectorKey = Object.keys(configValue).find(k => k.startsWith('@'));

                if (attributeSelectorKey && Array.isArray(obj[key]['custom-attribute'])) {
                    const [attrName, attrValue] = attributeSelectorKey.slice(1).split('=');

                    obj[key]['custom-attribute'] = obj[key]['custom-attribute'].filter(item => {
                        return item['$'] && item['$'][attrName] === attrValue;
                    });

                    obj[key]['custom-attribute'].forEach(item => {
                        filterXmlByConfig(item, configValue[attributeSelectorKey]);
                    });
                } else {
                    filterXmlByConfig(obj[key], configValue);
                }
            }
        } else {
            delete obj[key];
        }
    }
}

// Function to check if an object is empty (no child keys)
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Read and parse the XML file synchronously
const data = fs.readFileSync('catalog.xml', 'utf8');
const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

parser.parseString(data, (err, result) => {
    if (err) throw err;

    const categories = result.catalog.category;

    // Ensure categories is an array
    const categoryArray = Array.isArray(categories) ? categories : [categories];

    // Filter categories based on filtered content
    const filteredCategories = categoryArray
        .map(category => {
            filterXmlByConfig(category, config.catalog.category);
            return category;
        })
        .filter(category => !isEmpty(category));

    // Replace original categories with filtered ones
    result.catalog.category = filteredCategories;

    // If no categories remain, optionally remove the category array entirely:
    if (filteredCategories.length === 0) {
        delete result.catalog.category;
    }

    // Build and save the filtered XML
    const filteredXml = builder.buildObject(result);
    fs.writeFileSync('filtered_catalog.xml', filteredXml);

    console.log('Filtered XML saved to filtered_catalog.xml');
});


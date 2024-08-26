'use strict';

const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const dot = require('./dot');
const cwd = process.cwd();

const CONFIG = {
    ATTR_SYMBOL: '$',
    ENTRY: {
        PATH: './xml/20240804_SamsoniteSharedLibrary.xml'
    },
    ITEM: {
        TAG: 'library.content'
    },
    FILTER_ITEM: {
        TAG: '$.content-id',
        VALUES: [
            'footer-about-revamp-2024',
            'footer-account-revamp-2024',
            'footer-column-m-revamp-2024',
            'footer-copy-include-workaround',
            'footer-copy-revamp-2024',
            'footer-newsletter-revamp-2024',
            'footer-other-brands-revamp-2024',
            'footer-social-revamp-2024',
            'footer-support-revamp-2024',
            'experience-product-luggage',
            'homepage-recommendation-fourth',
            'homepage-recommendation-third',
            'new-mobile-footer-menu-revamp-2024',
            'home-instagram-revamp-2024',
            'home-why-shop-with-us-revamp-2024'
        ]
    },
    REMOVE_ITEM: {
        TAG: 'library.folder',
    },
    OUTPUT: {
        PATH: './xml/export/20240804_SamsoniteSharedLibrary.xml'
    }
}

/**
 * Parse XML to JSON
 * @returns {Promise<any>} - Promise handler
 */
function xmlToJSON() {
    const xmlPath = path.join(cwd, CONFIG.ENTRY.PATH);
    const xml = fs.readFileSync(xmlPath, {
        encoding: 'utf8'
    });
    return xml2js.parseStringPromise(xml);
}

/**
 * Build XML string from object
 * @param {Object} obj - XML JSON object
 * @returns {string} - XML string
 */
function buildXML(obj) {
    let builder = new xml2js.Builder();
    let xmlStr = builder.buildObject(obj);
    return xmlStr;
}

/**
 * Clone an object
 * @param {Object} source - Source object
 * @returns {Object} - A cloned object
 */
function clone(source) {
    return JSON.parse(JSON.stringify(source));
}

/**
 * Get XML node item array
 * @param {Object} source - XML JSON Object
 * @returns {Array|null} - XML node item array
 */
function getXmlNodeItems(source) {
    let cloneObj = source ? clone(source) : null;
    if (cloneObj) {
        let items = dot.getProp(cloneObj, CONFIG.ITEM.TAG);
        if (items && Array.isArray(items)) return items;
    }
    return null;
}

/**
 * Filter item to export
 * @param {Array} items - items
 */
function filterItems(items) {
    return items.filter(item => {
        let tagValueToMatch = dot.getProp(item, CONFIG.FILTER_ITEM.TAG);
        return CONFIG.FILTER_ITEM.VALUES.indexOf(tagValueToMatch) !== -1;
    });
}

async function main() {
    let xmlObj = await xmlToJSON();
    let items = getXmlNodeItems(xmlObj);

    if (!items) {
        console.log('No item.');
        return;
    }

    let filteredItems = filterItems(items);
    let finalObj = clone(xmlObj);

    dot.set(finalObj, CONFIG.ITEM.TAG, filteredItems);
    dot.remove(finalObj, CONFIG.REMOVE_ITEM.TAG);

    let finalXml = buildXML(finalObj);

    fs.writeFileSync(CONFIG.OUTPUT.PATH, finalXml);
}

main();

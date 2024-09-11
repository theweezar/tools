'use strict';

const path = require('path');
const moment = require('moment');
const helpers = require('./helpers');
const dot = require('./dot');
const cwd = process.cwd();

const config = {
    source: 'ignore/20240905_library_SamsoniteSharedLibrary.xml',
    assetID: {
        'footer-copy-include-workaround': ['ja-JP', 'en-AU']
    },
    exportPattern: 'samae-580_in-homepage-revamp_footer-content'
};

function createContentMapByID(xmlObj) {
    const objWithContentIDAsKey = {};
    const contentArray = xmlObj && xmlObj.library && xmlObj.library.content;
    if (Array.isArray(contentArray)) {
        contentArray.forEach(content => {
            let id = content.$ && content.$['content-id'];
            if (id) objWithContentIDAsKey[id] = content;
        });
    }
    return objWithContentIDAsKey;
}

/**
 * Filter custom attributes based on locale array
 * @param {Object} asset - Content Asset XML object
 * @param {Array} localeArr - Locale array
 */
function filterCustomAttrBasedOnLocale(asset, localeArr) {
    const customAttrs = dot.getProp(asset, 'custom-attributes.0.custom-attribute');
    let finalCustomAttrs = [];

    if (Array.isArray(customAttrs)) {
        let filteredCustomAttrs = customAttrs.filter(attrXml => {
            const xmlLang = attrXml && attrXml.$ && attrXml.$['xml:lang'];
            return localeArr.includes(xmlLang);
        });
        finalCustomAttrs = finalCustomAttrs.concat(filteredCustomAttrs);
    }

    return finalCustomAttrs;
}

async function main() {
    const xmlPath = path.join(cwd, config.source);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);
    const contentMapByID = createContentMapByID(fullXmlObj);

    const filteredContents = Object.keys(config.assetID).map(ID => {
        const asset = contentMapByID[ID];
        const locale = config.assetID[ID];
        const filteredCustomAttrs = filterCustomAttrBasedOnLocale(asset, locale);

        dot.set(asset, 'custom-attributes.0.custom-attribute', filteredCustomAttrs);

        return asset;
    });

    fullXmlObj.library.content = filteredContents;
    if (fullXmlObj.library.folder) delete fullXmlObj.library.folder;

    const finalXml = helpers.buildXML(fullXmlObj);
    const date = moment().format('YYYYMMDDkkmmss');
    helpers.exportXml(xmlPath, finalXml, `${date}_${config.exportPattern}.xml`);
}

main();

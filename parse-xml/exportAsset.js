'use strict';

const path = require('path');
const helpers = require('./helpers/helpers');
const assetHelpers = require('./helpers/assetHelpers');
const dot = require('./dot');
const cwd = process.cwd();

const config = {
    source: 'ignore/20240905_library_SamsoniteSharedLibrary.xml',
    assetID: {
        'footer-copy-include-workaround': ['ja-JP', 'en-AU'],
        'footer-newsletter-revamp-2024': ['en-AU'],
        'footer-other-brands-revamp-2024': ['en-AU'],
        'footer-support-revamp-2024': ['en-AU'],
        'footer-about-revamp-2024': ['en-AU'],
        'footer-account-revamp-2024': ['en-AU'],
        'footer-social-revamp-2024': ['en-AU'],
        'footer-column-m-revamp-2024': ['en-AU'],
        'footer-copy-revamp-2024': ['en-AU'],
        'footer-copy-include-workaround': ['en-AU'],
        'experience-product-luggage': ['en-AU'],
        'homepage-recommendation-third': ['en-AU'],
        'homepage-recommendation-fourth': ['en-AU'],
        'new-mobile-footer-menu-revamp-2024': ['en-AU'],
        'home-instagram-revamp-2024': ['en-AU'],
        'home-why-shop-with-us-revamp-2024': ['en-AU']
    },
    exportPattern: 'samae-580_au-homepage-revamp_footer-content'
};

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

function proceedToFilterAsset(xmlObj) {
    const contentMapByID = assetHelpers.createContentMapByID(xmlObj);
    return Object.keys(config.assetID).map(ID => {
        const asset = contentMapByID[ID];
        const locale = config.assetID[ID];

        if (asset && locale) {
            const filteredCustomAttrs = filterCustomAttrBasedOnLocale(asset, locale);
            dot.set(asset, 'custom-attributes.0.custom-attribute', filteredCustomAttrs);
            return asset;
        }

        return null;
    }).filter(asset => {
        return asset !== null;
    });
}

async function main() {
    const xmlPath = path.join(cwd, config.source);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);
    const filteredContents = proceedToFilterAsset(fullXmlObj);

    assetHelpers.proceedToExportXml(xmlPath, config.exportPattern, fullXmlObj, filteredContents, null);

    console.log(`Request to export ${Object.keys(config.assetID).length} content(s).`);
    console.log(`Exported ${filteredContents.length} content(s).`);
}

main();

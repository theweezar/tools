'use strict';

const path = require('path');
const helpers = require('./helpers/helpers');
const assetHelpers = require('./helpers/assetHelpers');
const cwd = process.cwd();

const CONFIG = {
    SOURCE: 'ignore/20240905_library_SamsoniteSharedLibrary.xml',
    PAGE_ID: [
        'jp-homepage-revamp'
    ],
    EXPORT_PATTERN: 'export-page'
};

function getContentLinkIDs(content) {
    const contentLinks = content && content['content-links'] && content['content-links'][0] && content['content-links'][0]['content-link'];
    if (Array.isArray(contentLinks)) {
        return contentLinks.map(contentLink => {
            return contentLink.$['content-id'];
        });
    }
    return [];
}

/**
 * Extract related layout, region, component IDs of the page to one array
 * @param {Object} xmlObj - Source XML object
 * @returns {Array} - Content array
 */
function extractRelatedContent(xmlObj) {
    const contentMapByID = assetHelpers.createContentMapByID(xmlObj);
    let relatedContentIDs = [].concat(CONFIG.PAGE_ID);

    for (let i = 0; i < relatedContentIDs.length; i++) {
        const contentID = relatedContentIDs[i];
        const content = contentMapByID[contentID];
        const contentLinkIDs = getContentLinkIDs(content);
        relatedContentIDs = [...new Set([...relatedContentIDs, ...contentLinkIDs])];
    }

    return relatedContentIDs.map(contentID => {
        return contentMapByID[contentID];
    }).filter(content => {
        return !!content;
    });
}

async function main() {
    const xmlPath = path.join(cwd, CONFIG.SOURCE);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);
    const relatedContents = extractRelatedContent(fullXmlObj);

    assetHelpers.proceedToExportXml(xmlPath, CONFIG.EXPORT_PATTERN, fullXmlObj, relatedContents, null);

    console.log(`Exported ${CONFIG.PAGE_ID.length} page(s) with ${relatedContents.length} content(s).`);
}

main();

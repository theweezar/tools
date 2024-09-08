'use strict';

const path = require('path');
const moment = require('moment');
const helpers = require('./helpers');
const cwd = process.cwd();

const CONFIG = {
    SOURCE: 'ignore/20240905_library_SamsoniteSharedLibrary.xml',
    PAGE_ID: [
        'jp-homepage-revamp'
    ],
    EXPORT_PATTERN: 'export-page'
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
    const contentMapByID = createContentMapByID(xmlObj);
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

    console.log(`Related content amount: ${relatedContents.length}`);

    fullXmlObj.library.content = relatedContents;
    if (fullXmlObj.library.folder) delete fullXmlObj.library.folder;

    const finalXml = helpers.buildXML(fullXmlObj);
    const date = moment().format('YYYYMMDDkkmmss');
    helpers.exportXml(xmlPath, finalXml, `${date}_${CONFIG.EXPORT_PATTERN}.xml`);
}

main();

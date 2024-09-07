'use strict';

const path = require('path');
const moment = require('moment');
const helpers = require('./helpers');
const cwd = process.cwd();

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

async function main() {
    const relativeFilePath = 'ignore/20240905_library_SamsoniteSharedLibrary.xml';
    const pageIDs = [
        'jp-homepage-revamp',
        'tw-homepage-revamp'
    ];
    const exportFilePattern = 'export-page';
    const xmlPath = path.join(cwd, relativeFilePath);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);

    /** Extract related layout, region, component IDs of the page to one array */
    const contentMapByID = createContentMapByID(fullXmlObj);
    let relatedContentIDs = [].concat(pageIDs);

    for (let i = 0; i < relatedContentIDs.length; i++) {
        const contentID = relatedContentIDs[i];
        const content = contentMapByID[contentID];
        const contentLinkIDs = getContentLinkIDs(content);
        relatedContentIDs = [...new Set([...relatedContentIDs ,...contentLinkIDs])];
    }

    const relatedContents = relatedContentIDs.map(contentID => {
        return contentMapByID[contentID];
    }).filter(content => {
        return !!content;
    });
    /** */

    console.log(`Related content amount: ${relatedContents.length}`);

    fullXmlObj.library.content = relatedContents;
    if (fullXmlObj.library.folder) delete fullXmlObj.library.folder;

    const finalXml = helpers.buildXML(fullXmlObj);
    const date = moment().format('YYYYMMDDkkmmss');
    helpers.exportXml(xmlPath, finalXml, `${date}_${exportFilePattern}.xml`);
}

main();

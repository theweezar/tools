'use strict';

const path = require('path');
const helpers = require('./helpers');
const cwd = process.cwd();

function createContentMapByID(xmlObj) {
    const objWithContentIDAsKey = {};
    const contentArray = xmlObj.library.content;
    contentArray.forEach(content => {
        objWithContentIDAsKey[content.$['content-id']] = content;
    });
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
    const relativeFilePath = './ignore/20240905_library_SamsoniteSharedLibrary.xml';
    const pageID = 'jp-homepage-revamp';
    const xmlPath = path.join(cwd, relativeFilePath);
    const fullXmlObj = await helpers.xmlToJSON(xmlPath);

    /** Extract related layout, region, component IDs of the page to one array */
    const contentMapByID = createContentMapByID(fullXmlObj);
    let relatedContentIDs = [pageID];

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
    helpers.exportXml(xmlPath, finalXml, `202409095_${pageID}.xml`);
}

main();

'use strict';

const moment = require('moment');
const helpers = require('./helpers');

/**
 * Create a content assets mapping object with content ID is the key
 * @param {Object} xmlObj - XML Object
 * @returns {Object} - A content assets mapping object with content ID is the key
 */
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
 * Proceed to export XML file
 * @param {string} xmlSourcePath - XML source relative/abs path
 * @param {string} exportPattern - XML export file name pattern
 * @param {Object} xmlObj - XML Object
 * @param {Array} contentArray - New content array after the process
 * @param {Array} folderArray - New folder array after the process
 */
function proceedToExportXml(xmlSourcePath, exportPattern, xmlObj, contentArray, folderArray) {
    if (Array.isArray(contentArray)) {
        xmlObj.library.content = contentArray;
    } else if (xmlObj.library.content) {
        delete xmlObj.library.content;
    }

    if (Array.isArray(folderArray)) {
        xmlObj.library.folder = folderArray;
    } else if (xmlObj.library.folder) {
        delete xmlObj.library.folder;
    }

    const finalXml = helpers.buildXML(xmlObj);
    const date = moment().format('YYYYMMDDkkmmss');
    helpers.exportXml(xmlSourcePath, finalXml, `${date}_${exportPattern}.xml`);
}

module.exports = {
    createContentMapByID,
    proceedToExportXml
};

'use strict';

const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

/**
 * Parse XML to JSON
 * @returns {Promise<any>} - Promise handler
 */
function xmlToJSON(path) {
    const xml = fs.readFileSync(path, {
        encoding: 'utf8'
    });
    return xml2js.parseStringPromise(xml);
}

/**
 * Build XML string from object
 * @param {Object} xmlObj - XML JSON object
 * @returns {string} - XML string
 */
function buildXML(xmlObj) {
    const builder = new xml2js.Builder();
    const xmlStr = builder.buildObject(xmlObj);
    return xmlStr;
}

/**
 * Export XML
 * @param {string} originFilePath - Origin path before processing
 * @param {string} xml - XML string
 * @param {string|null|undefined} exportFileName - Export file name
 */
function exportXml(originFilePath, xml, exportFileName) {
    const split = originFilePath.split('\\');    
    const fileName = split.pop();
    const folder = split.join('\\');
    const exportFolderPath = path.join(folder, 'export');
    const exportFilePath = exportFileName && typeof exportFileName === 'string'
        ? path.join(folder, 'export', exportFileName)
        : path.join(folder, 'export', fileName);

    if (!fs.existsSync(exportFolderPath)) {
        fs.mkdirSync(exportFolderPath);
    }
    
    fs.writeFileSync(exportFilePath, xml);
    console.log(`Export to folder: ${exportFolderPath}`);
    console.log(`Write to file: ${exportFilePath}`);
}

module.exports = {
    xmlToJSON: xmlToJSON,
    buildXML: buildXML,
    exportXml: exportXml
};

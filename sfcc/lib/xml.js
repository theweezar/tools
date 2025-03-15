'use strict';

const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
const object = require('./object');

/**
 * Parses an XML file to JSON.
 * @param {string} path - The file path of the XML file.
 * @returns {Promise<any>} - A promise that resolves to the parsed JSON object.
 */
function xmlToJSON(path) {
    const xml = fs.readFileSync(path, {
        encoding: 'utf8'
    });
    return xml2js.parseStringPromise(xml);
}

/**
 * Builds an XML string from a JSON object.
 * @param {Object} xmlObj - The JSON representation of XML.
 * @returns {string} - The formatted XML string.
 */
function buildXML(xmlObj) {
    const builder = new xml2js.Builder({
        renderOpts: {
            pretty: true,
            indent: '    ',
            newline: '\n'
        }
    });
    const xmlStr = builder.buildObject(xmlObj);
    return xmlStr;
}

/**
 * Recursively lists all files in a folder and adds their paths to an array.
 * @param {Array<string>} pathArray - The array to store file paths.
 * @param {string} folderPath - The path of the folder to search.
 */
function ls(pathArray, folderPath) {
    let files = fs.readdirSync(folderPath);
    files.forEach(file => {
        let filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) ls(pathArray, filePath);
        else pathArray.push(filePath);
    });
}

/**
 * Processes XML preference files within a given folder.
 * @param {Object} options - Options for processing.
 * @param {string} options.path - The folder path to process.
 * @param {string} [options.mode='development'] - The mode to filter preferences.
 */
function process(options) {
    let folderPath = options.path;
    let mode = options.mode || 'development';

    if (!folderPath) {
        this.missingArgument('path');
        return;
    }

    folderPath = path.resolve(folderPath);
    if (!fs.existsSync(folderPath)) {
        console.error('Folder not found');
        process.exit(1);
    }

    let filePathArray = [];
    ls(filePathArray, folderPath);

    filePathArray.forEach(filePath => {
        if (/(preferences\.xml)$/g.test(filePath)) {
            processPreferences(filePath, mode);
        }
    });
}

/**
 * Processes and updates an XML preference file.
 * @param {string} filePath - The path to the XML preference file.
 * @param {string} mode - The mode to filter preferences.
 */
async function processPreferences(filePath, mode) {
    let json = await xmlToJSON(filePath);
    let standardPrefs = object.resolve(json, 'preferences.standard-preferences.0');
    let customPrefs = object.resolve(json, 'preferences.custom-preferences.0');
    let instances = ['all-instances', mode];

    Object.keys(standardPrefs).forEach(ins => {
        if (!instances.includes(ins)) {
            object.set(json, `preferences.standard-preferences.0.${ins}`, [{}]);
        }
    });

    Object.keys(customPrefs).forEach(ins => {
        if (!instances.includes(ins)) {
            object.set(json, `preferences.custom-preferences.0.${ins}`, []);
        }
    });

    let newXml = buildXML(json);
    fs.writeFileSync(filePath, newXml);
}

module.exports = {
    process
};

'use strict';

const fs = require('fs');
const path = require('path');
const extractZip = require('extract-zip');
const AdmZip = require('adm-zip');

/**
 * Extracts a ZIP file to the same directory.
 * @param {string} filePath - The path to the ZIP file to be extracted.
 * @returns {Promise<void>} - A promise that resolves when extraction is complete.
 */
function extract(filePath) {
    let pathSplit = filePath.split('\\');
    let zipName = String(pathSplit.pop());

    if (!/(.zip)$/g.test(zipName.toLowerCase())) {
        console.error('Target is not a "*.zip" file')
        process.exit(1);
    }

    let output = pathSplit.length > 0 ? pathSplit.join('\\') : './';
    return extractZip(filePath, {
        dir: output
    });
}

/**
 * Compresses a folder into a ZIP file.
 * @param {string} filePath - The path to the folder to be compressed.
 * @returns {Promise<boolean>} - A promise that resolves when compression is complete.
 */
function compress(filePath) {
    let pathSplit = filePath.split('\\');
    let folder = String(pathSplit.pop());
    let zip = new AdmZip();
    zip.addLocalFolder(filePath, folder);
    return zip.writeZipPromise(`${filePath}.zip`, {
        overwrite: true
    });
}

/**
 * Processes the given options to either extract or compress a ZIP file.
 * @param {Object} options - The options for processing.
 * @param {string} options.path - The file or folder path to process.
 * @param {string} options.mode - The mode of operation ("extract" or "compress").
 */
function process(options) {
    let filePath = options.path;
    let mode = options.mode;

    if (!filePath) {
        this.missingArgument('path');
        return;
    }
    if (!mode) {
        this.missingArgument('mode');
        return;
    }

    filePath = path.resolve(filePath);
    if (!fs.existsSync(filePath)) {
        console.log('File not found');
    }

    switch (mode) {
        case 'extract':
            extract(filePath)
                .then(() => console.log('Extracted file successfully'))
                .catch(error => console.error(error));
            break;

        case 'compress':
            compress(filePath)
                .then(() => console.log('Zipped file successfully'))
                .catch(error => console.error('Failed to compress zip file. Error', error))
            break;

        default:
            this.unknownOption(`mode=${mode}`)
            break;
    }
}

/**
 * Displays help information for using the script.
 */
function help() {
    console.log();
    console.log('  Examples:');
    console.log();
    console.log('    $ node cli.js zip -m extract -p <path>.zip');
    console.log('    $ node cli.js zip -m compress -p <folder path>');
    console.log();
}

module.exports = {
    process,
    help
};

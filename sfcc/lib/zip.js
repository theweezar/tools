'use strict';

const fs = require('fs');
const path = require('path');
const extractZip = require('extract-zip');

/**
 * 
 * @param {string} filePath 
 * @param {string} output 
 */
async function extract(filePath, output) {
    await extractZip(filePath, {
        dir: output
    });
}

/**
 * 
 * @param {string} filePath 
 */
async function compress(filePath) {
}

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
            let split = filePath.split('\\');
            split.pop();
            let output = split.length > 0 ? split.join('\\') : './';
            extract(filePath, output);
            break;

        case 'compress':
            compress(filePath);
            break;

        default:
            zip.close();
            break;
    }
}

function help() {

}

module.exports = {
    process,
    help
};

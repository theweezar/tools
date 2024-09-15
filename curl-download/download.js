'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const cmd = require('./helpers/cmd');
const cwd = process.cwd();

const config = (() => {
    const configJson = require(path.join(cwd, './download.config.json'));

    const parseEntryModel = () => {
        return configJson.entries.map(url => {
            let url = new URL(url);
            return {
                fileName: url.split('/').pop(),
                hostName: url.hostname,
                relativePath: url.pathname.substring(0, url.pathname.lastIndexOf('/')),
                fullPath: url
            };
        });
    };

    return {
        outputPath: path.join(cwd, configJson.output),
        entries: parseEntryModel()
    };
})();

/**
 * Create folder if not exist
 */
function mkDirIfNotExist() {
    if (!fs.existsSync(config.outputPath)) {
        fs.mkdirSync(config.outputPath);
    }
}

/**
 * Get all file name in output folder
 * @returns {Array} - file name array
 */
function getFilesInOuputDir() {
    const files = shell.ls(config.outputPath);
    return files.map(file => file);
}

function execute() {
    mkDirIfNotExist();

    let fileNames = getFilesInOuputDir();
    let count = 0;

    config.entries.forEach(entryModel => {
        if (!fileNames.includes(entryModel.fileName)) {
            cmd.exeCurl(
                entryModel.fullPath,
                path.join(config.outputPath, entryModel.fileName)
            );
            count++;
        }
    });

    console.log(`Downloaded ${count} files`);
}

execute();

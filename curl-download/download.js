'use strict';

const child_process = require('child_process');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
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

function runCmd(cmd) {
    try {
        let resp = child_process.execSync(cmd);
        let result = resp.toString('UTF8');
        return result;
    } catch (error) {}
}

function mkDirIfNotExist() {
    if (!fs.existsSync(config.outputPath)) {
        fs.mkdirSync(config.outputPath);
    }
}

function getFilesInOuputDir() {
    const files = shell.ls(config.outputPath);
    return files.map(file => file);
}

function exeCurl(link, output) {
    let params = {
        '-o': output,
        '\0': link
    };
    let query = Object.keys(params).reduce((currentValue, element) => {
        let copied = currentValue;
        if (element === '\0') copied += ` ${params[element]}`;
        else copied += `${element} ${params[element]}`;
        return copied;
    }, '');
    let cmd = `curl ${query}`;
    console.log(cmd);
    runCmd(cmd);
}

function execute() {
    mkDirIfNotExist();

    let fileNames = getFilesInOuputDir();
    let count = 0;

    config.entries.forEach(entryModel => {
        if (!fileNames.includes(entryModel.fileName)) {
            exeCurl(
                entryModel.fullPath,
                path.join(config.outputPath, entryModel.fileName)
            );
            count++;
        }
    });

    console.log(`Downloaded ${count} files`);
}

execute();

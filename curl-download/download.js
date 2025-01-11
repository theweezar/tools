'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cmd = require('./helpers/cmd');
const { default: axios } = require('axios');
const { default: strings } = require('@supercharge/strings');
const cwd = process.cwd();

const config = (() => {
    const configJson = require(path.join(cwd, './curl-download/download.config.json'));

    /**
     * Create file name from the URL Object
     * @param {URL} url - URL Object
     * @returns {string} - Return the file name
     */
    const createFileNameFromURL = (url) => {
        const hashNameType = ['patreonusercontent'];
        const fileExt = url.pathname.split('.').pop() || 'jpg';
        const fileName = hashNameType.includes(configJson.type) ?
            crypto.createHash('md5').update(url.pathname).digest('hex').substring(0, 6) :
            (url.pathname.split('/').pop() || strings.random(8));

        return (new RegExp(`(.${fileExt})$`)).test(fileName) ? fileName : `${fileName}.${fileExt}`;
    }

    const parseEntryModel = () => {
        return configJson.entries.map(entry => {
            let url = new URL(entry);
            return {
                fileName: createFileNameFromURL(url),
                hostName: url.hostname,
                relativePath: url.pathname.substring(0, url.pathname.lastIndexOf('/')),
                fullPath: url.href
            };
        });
    };

    return {
        outputPath: path.join(cwd, configJson.output),
        entries: parseEntryModel(),
        type: configJson.type || 'direct'
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

function executePatreonDownloader() {
    const option = {
        headers: {
            cookie: "patreon_device_id=4a042cb4-4511-40b7-8afb-ef2892a88f26; patreon_location_country_code=VN; patreon_locale_code=en-US; __ssid=3bc3345b0b963641c34b8fb37754070; g_state={\"i_l\":0}; session_id=mgycZOhSZBFSmVOl5j5auyLG2_ciax1x1dr2LY_dpT8; __cf_bm=XdUKmnsE4KhDY9bRKD3BRByDIyPSN1.cx1KyqZFGaZw-1728835611-1.0.1.1-MyjOLLMY1aOG5P.zqavXTZWP1oqUoCSdhdcTJYer2QT1pDLuYBSOoM3ci2lznhzOzX86UfawDfEN4tpJBpvIQ215Re_YXNpu0FzQT7idD5k; analytics_session_id=97c88742-0e9b-4188-ad1a-38952b888fd2"
        }
    };

    config.entries.forEach(async (entryModel) => {
        let res = await axios.get(entryModel.fullPath, option);
        let exposedHeader = res.request._header;
        let split = typeof exposedHeader === 'string' ? exposedHeader.split(/GET ([^]*) HTTP\/1.1(?:[^]*)/g) : [];
        let endpoint = split.length >= 2 ? split[1] : '';
        let contentType = res.headers['Content-Type'];
        let contentDisposition = res.headers['content-disposition'];
        let fileExt = String(contentType).split('/').pop() || 'png';
        let fileName = (contentDisposition && typeof contentDisposition === 'string' && contentDisposition.split(/filename="([^"]*)"/g)[1])
            || `${strings.random(8)}.${fileExt}`;

        if (endpoint) {
            let baseUrl = new URL('https://c10.patreonusercontent.com');
            let mediaUrl = new URL(endpoint, baseUrl);
            cmd.exeCurl(
                mediaUrl.href,
                path.join(config.outputPath, fileName)
            );
        }
    });
}

/**
 * Direct download
 * @param {Array} fileExistingInDir - Files are existing in dir
 */
function directDownload(fileExistingInDir) {
    let count = 0;
    config.entries.forEach(entryModel => {
        if (!fileExistingInDir.includes(entryModel.fileName)) {
            cmd.exeCurl(
                entryModel.fullPath,
                path.join(config.outputPath, entryModel.fileName)
            );
            count++;
        }
    });
    console.log(`Downloaded ${count} files`);
}

function execute() {
    mkDirIfNotExist();

    let fileExistingInDir = getFilesInOuputDir();

    switch (config.type) {
        case 'direct':
        case 'patreonusercontent':
            directDownload(fileExistingInDir);
            break;

        case 'patreon':
            executePatreonDownloader();
            break;

        default:
            break;
    }
}

execute();

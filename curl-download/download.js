'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const cmd = require('./helpers/cmd');
const { default: axios } = require('axios');
const cwd = process.cwd();

const config = (() => {
    const configJson = require(path.join(cwd, './curl-download/download.config.json'));

    const parseEntryModel = () => {
        return configJson.entries.map(entry => {
            let url = new URL(entry);
            return {
                fileName: entry.split('/').pop(),
                hostName: url.hostname,
                relativePath: url.pathname.substring(0, url.pathname.lastIndexOf('/')),
                fullPath: url
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
    config.entries.forEach(async (entryModel) => {
        let res = await axios.get(entryModel.fullPath, {
            headers: {
                cookie: "patreon_device_id=4a042cb4-4511-40b7-8afb-ef2892a88f26; patreon_location_country_code=VN; patreon_locale_code=en-US; __ssid=3bc3345b0b963641c34b8fb37754070; g_state={\"i_l\":0}; session_id=mgycZOhSZBFSmVOl5j5auyLG2_ciax1x1dr2LY_dpT8; __cf_bm=XdUKmnsE4KhDY9bRKD3BRByDIyPSN1.cx1KyqZFGaZw-1728835611-1.0.1.1-MyjOLLMY1aOG5P.zqavXTZWP1oqUoCSdhdcTJYer2QT1pDLuYBSOoM3ci2lznhzOzX86UfawDfEN4tpJBpvIQ215Re_YXNpu0FzQT7idD5k; analytics_session_id=97c88742-0e9b-4188-ad1a-38952b888fd2"
            }
        });
        
        let exposedHeader = res.request._header;
        let split = typeof exposedHeader === 'string' ? exposedHeader.split(/GET ([^]*) HTTP\/1.1(?:[^]*)/g) : [];
        let endpoint = split.length >= 2 ? split[1] : '';

        console.log(res);

        if (endpoint !== '') {
            let baseUrl = new URL('https://c10.patreonusercontent.com');
            let mediaUrl = new URL(endpoint, baseUrl);
            // console.log(mediaUrl);
        }
    });
}

function execute() {
    mkDirIfNotExist();

    let fileNames = getFilesInOuputDir();
    let count = 0;

    switch (config.type) {
        case 'direct':
            config.entries.forEach(entryModel => {
                if (!fileNames.includes(entryModel.fileName)) {
                    cmd.exeCurl(
                        entryModel.fullPath,
                        path.join(config.outputPath, entryModel.fileName)
                    );
                    count++;
                }
            });
            break;

        case 'patreon':
            executePatreonDownloader();
            break;

        default:
            break;
    }

    // console.log(`Downloaded ${count} files`);
}

execute();

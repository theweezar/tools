'use strict';

const child_process = require('child_process');

/**
 * Execute command line
 * @param {string} cmd - Command line
 * @returns {string} - Return result
 */
function runCmd(cmd) {
    try {
        let resp = child_process.execSync(cmd);
        let result = resp.toString('UTF8');
        return result;
    } catch (error) {}
    return '';
}

/**
 * Execute CURL command line
 * @param {string} link - Source URL
 * @param {string} output - Output path
 */
function exeCurl(link, output) {
    let params = {
        '-o': output,
        '\0': link
    };
    let query = Object.keys(params).reduce((currentValue, element) => {
        let copied = currentValue;
        if (element === '\0') copied += ` "${params[element]}"`;
        else copied += `${element} "${params[element]}"`;
        return copied;
    }, '');
    let cmd = `curl ${query}`;
    console.log(cmd);
    runCmd(cmd);
}

module.exports = {
    exeCurl
};

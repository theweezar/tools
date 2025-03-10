'use strict';

const dwJson = require('./dw.json');
const webdav = require('sfcc-ci/lib/webdav');
const auth = require('sfcc-ci/lib/auth');
const path = require('path');
const sfcc_ci = require('sfcc-ci');

sfcc_ci.auth.auth(
    dwJson['client-id'],
    dwJson['client-secret'],
    (error, token) => {
        console.log('error:', error);
        console.log('token:', token);
        if (error === undefined) {
            downloadFile(token);
        } else {
            console.error(error);
        }
    }
);

downloadFile(auth.getAccessToken());

function downloadFile(token) {
    const cwd = process.cwd();
    const instance = '';
    const serverPath = 'Sites/Impex/src/instance/ci-cd/sfcc-ci-site.zip';
    const localFilePath = path.join(cwd, 'webdav', 'sfcc-ci-site.zip');

    webdav.downloadFile(
        instance,
        serverPath,
        token,
        localFilePath
    );
}

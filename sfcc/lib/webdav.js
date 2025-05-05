'use strict';

const lib_instance = require('sfcc-ci/lib/instance')
const lib_webdav = require('sfcc-ci/lib/webdav')
const lib_auth = require('sfcc-ci/lib/auth')

function download(options) {
    var instance = lib_instance.getInstance(options.instance);
    var path = (options.path ? options.path : null);
    if (!path) {
        this.missingArgument('path');
        return;
    }
    var target = (options.target ? options.target : null);
    if (!target) {
        this.missingArgument('target');
        return;
    }
    lib_webdav.downloadFile(instance, '/' + path, lib_auth.getToken(), target, {
        overrideLocalFile: options.overrideLocalFile
    });
}

function help() {
    console.log('');
    console.log('  Details:');
    console.log();
    console.log('  Downloads file from an instance WebDAV folder into target local folder.');
    console.log('  Although, there is no defined maximum size for downloaded files. You may want');
    console.log('  to zip or gzip the file you want to download.');
    console.log();
    console.log('  The provided --path <path> is relative to /webdav/Sites/, e.g. "impex/src/myfile.zip".');
    console.log();
    console.log('  Supported top level --path are "impex", "static", "catalogs", "libraries" and "dynamic".');
    console.log('  In order to use "catalogs", "libraries" and "dynamic" you have to set API permissions for');
    console.log('  a specific catalog, library or dynamic folder in WebDAV Client Permissions.');
    console.log();
    console.log('  Examples:');
    console.log();
    console.log('    $ node ./cli.js data:download --instance my-instance.demandware.net ' +
        '--path impex/src/instance/myfile.zip --target myfile.zip');
    console.log();
}

function deleteFile(options) {
    var instance = lib_instance.getInstance(options.instance);
    var path = (options.path ? options.path : null);
    if (!path) {
        this.missingArgument('path');
        return;
    }
    var file = (options.file ? options.file : null);
    if (!file) {
        this.missingArgument('file');
        return;
    }
    var filePath = path + '/' + file;
    console.log(`Deleting file ${filePath}`);
    lib_webdav.deleteFile(instance, '/' + path, file, lib_auth.getToken(), false, function (error, response, body) {
        console.log('Callback is called');
        if (error) {
            console.log('Error deleting file: ' + error);
            return;
        }
        if (response.statusCode === 200) {
            console.log('File deleted successfully: ' + file);
        } else {
            console.log('Error deleting file: ' + response.statusCode + ' - ' + body);
        }
    });
}

function deleteFileHelp() {
    console.log('');
    console.log('  Details:');
    console.log();
    console.log('  Deletes file from an instance WebDAV folder.');
    console.log('  The provided --path <path> is relative to /webdav/Sites/, e.g. "impex/src/myfile.zip".');
    console.log();
    console.log('  Supported top level --path are "impex", "static", "catalogs", "libraries" and "dynamic".');
    console.log('  In order to use "catalogs", "libraries" and "dynamic" you have to set API permissions for');
    console.log('  a specific catalog, library or dynamic folder in WebDAV Client Permissions.');
    console.log();
    console.log('  Examples:');
    console.log();
    console.log('    $ node ./cli.js data:delete --instance my-instance.demandware.net ' +
        '--path impex/src/instance/myfile.zip --file myfile.zip');
    console.log();
}

module.exports = {
    download,
    help,
    deleteFile,
    deleteFileHelp
}

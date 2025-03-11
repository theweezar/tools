'use strict';

const program = require('commander');
const webdav = require('./lib/webdav');

program
    .command('data:download')
    .option('-i, --instance <instance>', 'Instance to download the file from. Can be an ' +
        'instance alias. If not specified the currently configured instance will be used.')
    .option('-p, --path <path>', 'The path of the file (WebDAV) to download')
    .option('-t, --target <target>', 'The local file path where to store the file')
    .option('-o, --overrideLocalFile <overrideLocalFile>', 'Override existing local file')
    .description('Downloads a file from a Commerce Cloud instance')
    .action(webdav.download)
    .on('--help', webdav.help);

program.parse(process.argv);

'use strict';

const program = require('commander');
const webdav = require('./lib/webdav');
const zip = require('./lib/zip');
const xml = require('./lib/xml');

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

program
    .command('data:delete')
    .option('-i, --instance <instance>', 'Instance to download the file from. Can be an ' +
        'instance alias. If not specified the currently configured instance will be used.')
    .option('-p, --path <path>', 'The path of the file (WebDAV) to delete')
    .option('-f, --file <target>', 'The remote file name to delete')
    .description('Deletes a file from a Commerce Cloud instance')
    .action(webdav.deleteFile)
    .on('--help', webdav.deleteFileHelp);

// node cli.js zip -m extract -p ./webdav/<file>.zip -r 1
// node cli.js zip -m compress -p ./webdav/<file>
program
    .command('zip')
    .option('-p, --path <path>', 'The path of the zip file or folders/files')
    .option('-m, --mode <extract or compress>', 'Mode: Extract or Compress')
    .option('-r, --remove <1 or 0>', 'Remove source after processing')
    .description('Processes Zip')
    .action(zip.process)
    .on('--help', zip.help);

// node cli.js start -p ./webdav/<folder>
program
    .command('start')
    .option('-p, --path <path>', 'The site folder path')
    .option('-m, --mode <development/staging/production>', 'Filtering mode')
    .description('Processes site data')
    .action(xml.process)

program.parse(process.argv);

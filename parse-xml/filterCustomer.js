'use strict';

const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const dot = require('./dot');
const helpers = require('./helpers');
const cwd = process.cwd();

let customerNumbers = [
    '00251044',
    '00252540',
    '00267041',
    '00269043',
    '00270540',
    '00268040',
    '00269041',
    '00286545',
    '00269040',
    '00296562',
    '00289047',
    '00298560',
    '00269044',
    '00292546',
    '00270541',
    '00286546',
    '00290040',
    '00298559',
    '00298558',
    '00365060',
    '00510072'
];

async function main() {
    const relativeFilePath = './ignore/20240831_MonoLipaultSG.xml';

    const xmlPath = path.join(cwd, relativeFilePath);

    const fullXmlObj = await helpers.xmlToJSON(xmlPath);
    console.log(fullXmlObj);

    const fullCustomerList = fullXmlObj['customer-list']['customer'];

    const filteredCustomers = fullCustomerList.filter(customer => {
        let customerNo = String(customer.$['customer-no']);
        return customerNumbers.includes(customerNo);
    });

    fullXmlObj['customer-list']['customer'] = filteredCustomers;

    const finalXml = helpers.buildXML(fullXmlObj);
    helpers.exportXml(relativeFilePath, finalXml, '20240831_defaultpwd_MonoLipaultSG.xml');
};

main();

'use strict';

const path = require('path');
const helpers = require('./helpers');
const cwd = process.cwd();
const customerNumbers = require('./customerNumbers.json');

async function main() {    
    const relativeFilePath = './ignore/20240831_2250vnt_list_MonoLipaultSG.xml';

    const xmlPath = path.join(cwd, relativeFilePath);

    const fullXmlObj = await helpers.xmlToJSON(xmlPath);

    const fullCustomerList = fullXmlObj['customer-list']['customer'];

    const filteredCustomers = fullCustomerList.filter(customer => {
        let customerNo = String(customer.$['customer-no']);
        return customerNumbers.includes(customerNo);
    });

    fullXmlObj['customer-list']['customer'] = filteredCustomers;

    const finalXml = helpers.buildXML(fullXmlObj);
    helpers.exportXml(xmlPath, finalXml, '20240831_defaultpwd_MonoLipaultSG.xml');
};

main();

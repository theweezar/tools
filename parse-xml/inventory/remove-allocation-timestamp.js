"use strict";

const path = require("path");
const fs = require("fs");
const cwd = process.cwd();
const helpers = require("../helpers/helpers");
const object = require("../lib/object");

/**
 * Removes the 'allocation-timestamp' property from each record in the XML object
 * @param {string} filePath - Path to the XML file
 * @returns {Promise<Object>} - Returns a promise that resolves to the modified XML object
 */
async function removeAllocationTimestampInFile(filePath) {
  const fullXmlObj = await helpers.xmlToJSON(filePath);
  const xmlXPath = "inventory.inventory-list.0.records.0.record";
  const records = object.resolve(fullXmlObj, xmlXPath);

  if (Array.isArray(records)) {
    object.set(
      fullXmlObj,
      xmlXPath,
      records.map(record => {
        object.remove(record, "allocation-timestamp");
        return record;
      })
    );
  }

  return fullXmlObj;
}

async function main() {
  const folderPath = path.join(cwd, "ignore/inventory");
  const fileList = fs.readdirSync(folderPath).filter(file => file.endsWith(".xml"));

  for (const file of fileList) {
    const filePath = path.join(folderPath, file);
    console.log(`Processing file: ${filePath}`);
    const xmlObj = await removeAllocationTimestampInFile(filePath);
    const xmlStr = helpers.buildXML(xmlObj);
    helpers.exportXml(filePath, xmlStr, null);
  }
}

main();

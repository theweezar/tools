"use strict";

const path = require("path");
const fs = require("fs");
const helpers = require("../helpers/helpers");
const object = require("../lib/object");
const cwd = process.cwd();

const categoryIdsToKeep = [
  "backpack",
  "bag"
];

async function processFile(xmlFilePath = null, outXmlFilePath = null) {
  const fullXmlObj = await helpers.xmlToJSON(xmlFilePath);

  object.remove(fullXmlObj.catalog, "header");
  object.remove(fullXmlObj.catalog, "category-assignment");
  object.remove(fullXmlObj.catalog, "product");

  const categories = fullXmlObj.catalog.category;

  if (!Array.isArray(categories)) {
    console.log("Categories is not an array:", categories);
    return;
  }

  const filteredCategories = categories.filter(category => {
    let categoryId = category.$["category-id"];
    let keep = categoryIdsToKeep.includes(categoryId);

    if (keep) {
      Object.keys(category).forEach(key => {
        if (!["$", "refinement-definitions"].includes(key)) {
          delete category[key];
        }
      });
      return true;
    }

    return keep;
  });

  fullXmlObj.catalog.category = filteredCategories;

  const finalXml = helpers.buildXML(fullXmlObj);

  fs.writeFileSync(outXmlFilePath, finalXml);
}

function listFileRecursive(dirPath, format) {
  const files = fs.readdirSync(dirPath);
  const regex = new RegExp(format, "g");
  let result = [];

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      result = result.concat(listFileRecursive(filePath, format));
    } else if (regex.test(file)) {
      result.push(filePath);
    }
  });
  return result;
}

async function execute() {
  const dirPath = path.join(cwd, "ignore/catalog/20250620_sbx-028_ss-catalogs");
  const xmlFilePaths = listFileRecursive(dirPath, /\.xml$/);

  for (let i = 0; i < xmlFilePaths.length; i++) {
    const xmlFilePath = xmlFilePaths[i];
    const xmlDirName = path.dirname(xmlFilePath);
    const outXmlBaseName = "SE20-6226_sbx028_" + path.basename(xmlFilePath);
    const outXmlFilePath = path.join(xmlDirName, outXmlBaseName);
    await processFile(xmlFilePath, outXmlFilePath);
  }
}

execute();

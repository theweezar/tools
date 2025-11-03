"use strict";

const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");

/**
 * Parses an XML file to JSON.
 * @param {string} path - The file path of the XML file.
 * @returns {Promise<any>} - A promise that resolves to the parsed JSON object.
 */
function xmlToJSON(path) {
  const xml = fs.readFileSync(path, {
    encoding: "utf8"
  });
  return xml2js.parseStringPromise(xml);
}

/**
 * Builds an XML string from a JSON object.
 * @param {Object} xmlObj - The JSON representation of XML.
 * @returns {string} - The formatted XML string.
 */
function buildXML(xmlObj) {
  const builder = new xml2js.Builder({
    renderOpts: {
      pretty: true,
      indent: "    ",
      newline: "\n"
    }
  });
  const xmlStr = builder.buildObject(xmlObj);
  return xmlStr;
}

/**
 * Export XML
 * @param {string} originFilePath - Origin path before processing
 * @param {string} xml - XML string
 * @param {string|null|undefined} exportFileName - Export file name
 */
function exportXml(originFilePath, xml, exportFileName) {
  const split = originFilePath.split("\\");
  const fileName = split.pop();
  const folder = split.join("\\");
  const exportFolderPath = path.join(folder, "export");
  const exportFilePath = exportFileName && typeof exportFileName === "string"
    ? path.join(folder, "export", exportFileName)
    : path.join(folder, "export", fileName);

  if (!fs.existsSync(exportFolderPath)) {
    fs.mkdirSync(exportFolderPath);
  }

  fs.writeFileSync(exportFilePath, xml);
  console.log(`Exported to folder: ${exportFolderPath}`);
  console.log(`Wrote to file: ${exportFilePath}`);
}

module.exports = {
  xmlToJSON: xmlToJSON,
  buildXML: buildXML,
  exportXml: exportXml
};

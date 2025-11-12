"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Lists all .js files in the client/js folder.
 * @param {string} relativePath - relative path
 * @param {string} ext - file extension matching
 * @returns {Array} 
 */
function listFiles(relativePath, ext) {
  const folderPath = path.join(process.cwd(), relativePath);
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith(ext))
      .map(file => path.join(folderPath, file.name));
  } catch (error) {
    console.error(`Error reading folder: ${error.message}`);
    throw error;
  }
};

/**
 * Reads a file and returns its content as an ArrayBuffer.
 * @param {string} filePath - path to the file
 * @returns {ArrayBuffer|null} The content of the file as an ArrayBuffer, or null if an error occurs.
 */
function readBuffer(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer;
    return arrayBuffer;
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err}`);
  }
  return null;
}

module.exports = {
  listFiles,
  readBuffer
};
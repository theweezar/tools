"use strict";

import { readdirSync, readFileSync } from "fs";
import path from "path";

/**
 * Lists all files in the client/js folder.
 * @param {string} resolvedPath - resolved path
 * @param {string} ext - file extension matching
 * @returns {Array} 
 */
export function listFiles(resolvedPath, ext) {
  try {
    const files = readdirSync(resolvedPath, { withFileTypes: true });
    const filtering = (file) => {
      if (!file.isFile()) return false;
      if (!ext || ext === "*") return true;
      return file.name.endsWith(ext);
    };
    return files
      .filter(filtering)
      .map(file => path.join(resolvedPath, file.name));
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
export function readBuffer(filePath) {
  try {
    const buffer = readFileSync(filePath);
    const arrayBuffer = buffer.buffer;
    return arrayBuffer;
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err}`);
  }
  return null;
}

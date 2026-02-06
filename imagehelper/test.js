import shell from "shelljs";
import { globSync } from "glob";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";

// Resolve files using shelljs
const sourcePattern = "./ignore/catimg/big/*.avif";
// const files = shell.ls(sourcePattern).stdout.split("\n").filter(Boolean);
const files = fg.sync(sourcePattern);

if (files.length === 0) {
  console.error(`✗ No files found matching: ${sourcePattern}`);
  process.exit(1);
}

console.log(files);


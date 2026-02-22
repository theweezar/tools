#!node
"use strict";

import path from "path";
import { program } from "commander";
import { doAction as doMkIconAction } from "./mkicon.js";
import { doAction as doConvertAction } from "./convert.js";

/**
 * Main CLI setup
 */
program
  .name("index")
  .description("Resize square icons to multiple dimensions")
  .command("mkicon")
  .argument("<imagePath>", "Path to the source image file")
  .option(
    "-o, --output <dir>",
    "Output directory",
    path.resolve(process.cwd(), "output")
  )
  .option(
    "-p, --pattern <pattern>",
    "Output file name pattern",
    "icon"
  )
  .option(
    "-d, --dimensions <sizes>",
    "Dimensions separated by comma",
    "16,32,48,128"
  )
  .action(doMkIconAction);

program
  .command("convert")
  .argument("<source>", "Source image file path or wildcard pattern")
  .option(
    "-o, --output <dir>",
    "Output directory",
    path.resolve(process.cwd(), "converted")
  )
  .option(
    "-f, --from <format>",
    "Source image format (png, jpg, jpeg, webp, etc.)",
    "*"
  )
  .option(
    "-t, --to <format>",
    "Target image format (png, jpg, jpeg, webp, etc.)",
    "png"
  )
  .action(doConvertAction);

program.parse(process.argv);
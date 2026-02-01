"use strict";

import { listFiles, readBuffer } from "../lib/filesystem";
import { writeFileSync } from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";
import { Command } from "commander";

function mergePDFs(option) {
  const pdfPaths = listFiles(option.sourceDir, ".pdf").sort((a, b) => {
    try {
      return Number(path.basename(a).split("-")[0]) - Number(path.basename(b).split("-")[0]);
    } catch (error) {
      throw new Error(`Error sorting files: Needed format '{{number}}-filename.pdf' - ${error.message}`);
    }
  });

  (async () => {
    const mergedPdf = await PDFDocument.create();
    for (const pdfPath of pdfPaths) {
      const pdfBytes = readBuffer(pdfPath);
      if (pdfBytes) {
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    writeFileSync(option.output, Buffer.from(mergedPdfBytes));
    console.log(`Merged PDF saved to ${option.output}`);
  })();
}

const program = new Command();

program
  .command("merge")
  .description("Merge PDF files from a directory")
  .argument("<sourceDir>", "Source directory containing PDF files")
  .requiredOption("-o, --output <file>", "Output file path for merged PDF", "merged.pdf")
  .action((sourceDir, options) => {
    const resolvedOptions = {
      sourceDir: path.resolve(sourceDir),
      output: path.resolve(options.output)
    };
    mergePDFs(resolvedOptions);
  });

program.parse(process.argv);
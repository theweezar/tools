"use strict";

const PDFLib = require("pdf-lib");
const filesystem = require("../lib/filesystem");
const fs = require("fs");
const path = require("path");

function mergePDFs(outputPath) {
  const pdfPaths = filesystem.listFiles("ignore/cv/temp", ".pdf").sort((a, b) => {
    try {
      return Number(path.basename(a).split("-")[0]) - Number(path.basename(b).split("-")[0]);
    } catch (error) {
      throw new Error(`Error sorting files: Needed format '{{number}}-filename.pdf' - ${error.message}`);
    }
  });

  (async () => {
    const mergedPdf = await PDFLib.PDFDocument.create();
    for (const pdfPath of pdfPaths) {
      const pdfBytes = filesystem.readBuffer(pdfPath);
      if (pdfBytes) {
        const pdf = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, Buffer.from(mergedPdfBytes));
    console.log(`Merged PDF saved to ${outputPath}`);
  })();
}

mergePDFs(path.join(process.cwd(), "ignore/cv/CV_Fullstack_Developer_DucHoang.pdf"));
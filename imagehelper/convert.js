import path from "path";
import sharp from "sharp";
import { promises as fs } from "fs";
import { listFiles } from "../lib/filesystem.js";

/**
 * Get file extension from path
 * @param {string} filePath - File path
 * @returns {string} File extension without dot
 */
const getFileExtension = (filePath) => path.extname(filePath).slice(1) || "png";

/**
 * Convert and save image
 * @param {string} sourcePath - Source image path
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
const convertImage = async (sourcePath, outputPath) => {
  try {
    const transformer = sharp(sourcePath);

    const formatLower = getFileExtension(outputPath).toLowerCase();
    if (formatLower === "png") {
      await transformer.png().toFile(outputPath);
    } else if (formatLower === "jpg" || formatLower === "jpeg") {
      await transformer.jpeg().toFile(outputPath);
    } else if (formatLower === "webp") {
      await transformer.webp().toFile(outputPath);
    } else if (formatLower === "gif") {
      await transformer.gif().toFile(outputPath);
    } else {
      await transformer.toFile(outputPath);
    }

    console.log(`✓ Converted: ${sourcePath} → ${outputPath}`);
  } catch (error) {
    console.error(`✗ Error converting ${sourcePath}:`, error.message);
  }
};

/**
 * Process and convert images for source pattern
 * @param {string} files - Source image files
 * @param {string} outputDir - Output directory
 * @param {string} targetFormat - Target image format
 * @returns {Promise<void>}
 */
const processConversion = async (files, outputDir, targetFormat) => {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Process each file
    const convertPromises = files.map((file) => {
      const fileName = path.basename(file, path.extname(file));
      const outputFileName = `${fileName}.${targetFormat}`;
      const outputPath = path.resolve(outputDir, outputFileName);
      return convertImage(file, outputPath);
    });

    await Promise.all(convertPromises);
    console.log("\n✓ All images converted successfully!");
  } catch (error) {
    console.error("✗ Fatal error:", error.message);
    process.exit(1);
  }
};

/**
 * Main action function for image conversion
 * @param {string} source - Source path (directory or file)
 * @param {Object} options - Conversion options
 * @param {string} options.from - Source file extension
 * @param {string} options.to - Target file extension
 * @param {string} options.output - Output directory path
 */
const doAction = async (source, options) => {
  try {
    const resolvedSource = path.resolve(source);
    const files = listFiles(resolvedSource, options.from);

    if (files.length === 0) {
      console.error(`✗ No files found matching: ${source}`);
      process.exit(1);
    }

    console.log(`📷 Found ${files.length} file(s) to convert`);

    // Process conversion
    await processConversion(
      files,
      path.resolve(options.output),
      options.to || "png"
    );
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
};

export { doAction };

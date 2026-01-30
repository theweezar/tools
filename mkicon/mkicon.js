import path from "path";
import sharp from "sharp";
import { program } from "commander";
import { promises as fs } from "fs";

/**
 * Parse dimension string into array of dimension objects
 * @param {string} dimensionStr - Comma-separated dimensions (e.g., "16,32,48,128")
 * @returns {Array<{width: number, height: number, suffix: string}>}
 */
const parseDimensions = (dimensionStr) =>
  dimensionStr.split(",").map((dim, index) => {
    const size = parseInt(dim.trim(), 10);
    return { width: size, height: size, suffix: `_${size}` };
  });

/**
 * Get image metadata
 * @param {string} imagePath - Path to image file
 * @returns {Promise<{width: number, height: number}>}
 */
const getImageMetadata = async (imagePath) => {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  return { width: metadata.width, height: metadata.height };
};

/**
 * Validate dimensions against original image size
 * @param {Array} dimensions - Array of dimension objects
 * @param {number} maxWidth - Original image width
 * @param {number} maxHeight - Original image height
 * @returns {Array} Filtered dimensions that don't exceed original size
 */
const validateDimensions = (dimensions, maxWidth, maxHeight) =>
  dimensions.filter((dim) => {
    if (dim.width > maxWidth || dim.height > maxHeight) {
      console.warn(
        `⚠️  Dimension ${dim.width}x${dim.height} exceeds original size (${maxWidth}x${maxHeight}), skipping...`
      );
      return false;
    }
    return true;
  });

/**
 * Get file extension from path
 * @param {string} filePath - File path
 * @returns {string} File extension without dot
 */
const getFileExtension = (filePath) => path.extname(filePath).slice(1) || "png";

/**
 * Resize and save image
 * @param {string} sourcePath - Source image path
 * @param {string} outputPath - Output file path
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<void>}
 */
const resizeImage = async (sourcePath, outputPath, width, height) => {
  try {
    const ext = getFileExtension(sourcePath);
    const transformer = sharp(sourcePath).resize(width, height);

    if (ext.toLowerCase() === "png") {
      await transformer.png().toFile(outputPath);
    } else if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "jpeg") {
      await transformer.jpeg().toFile(outputPath);
    } else {
      await transformer.toFile(outputPath);
    }

    console.log(`✓ Image resized to ${width}x${height}: ${outputPath}`);
  } catch (error) {
    console.error(
      `✗ Error resizing image to ${width}x${height}:`,
      error.message
    );
  }
};

/**
 * Process and resize images for all dimensions
 * @param {string} imagePath - Source image path
 * @param {string} outputDir - Output directory
 * @param {string} fileNamePattern - Output file name pattern
 * @param {Array} dimensions - Array of dimension objects
 * @returns {Promise<void>}
 */
const processImages = async (imagePath, outputDir, fileNamePattern, dimensions) => {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get original image metadata
    const { width: origWidth, height: origHeight } = await getImageMetadata(
      imagePath
    );
    console.log(`📷 Original image size: ${origWidth}x${origHeight}`);

    // Validate dimensions
    const validDimensions = validateDimensions(
      dimensions,
      origWidth,
      origHeight
    );

    if (validDimensions.length === 0) {
      console.error("✗ No valid dimensions found.");
      process.exit(1);
    }

    // Get file extension from source
    const fileExt = getFileExtension(imagePath);

    // Process each dimension
    const resizePromises = validDimensions.map((dim) => {
      const outputFileName = `${fileNamePattern}${dim.suffix}.${fileExt}`;
      const outputPath = path.resolve(outputDir, outputFileName);
      return resizeImage(imagePath, outputPath, dim.width, dim.height);
    });

    await Promise.all(resizePromises);
    console.log("\n✓ All images processed successfully!");
  } catch (error) {
    console.error("✗ Fatal error:", error.message);
    process.exit(1);
  }
};

/**
 * Main CLI setup
 */
program
  .name("mkicon")
  .description("Resize square icons to multiple dimensions")
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
  .action(async (imagePath, options) => {
    try {
      // Resolve image path
      const resolvedImagePath = path.resolve(imagePath);

      // Validate image file exists
      await fs.access(resolvedImagePath);

      // Parse dimensions
      const dimensions = parseDimensions(options.dimensions);

      // Process images
      await processImages(
        resolvedImagePath,
        path.resolve(options.output),
        options.pattern,
        dimensions
      );
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error(`✗ Image file not found: ${imagePath}`);
      } else {
        console.error("✗ Error:", error.message);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);

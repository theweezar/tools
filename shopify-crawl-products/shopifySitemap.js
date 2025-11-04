"use strict";

const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const cwd = process.cwd();
const config = require("./config.json");
const outputfolder = path.join(cwd, config.sitemap.output);
const isHtmlMode = config.sitemap.mode === "html";

// Ensure output folder exists
if (!fs.existsSync(outputfolder)) {
  fs.mkdirSync(outputfolder, { recursive: true });
}

// Convert xml2js.parseString to promise-based function
const parseXML = promisify(xml2js.parseString);

// Fetch and parse XML content
const fetchXMLContent = async (url) => {
  try {
    const response = await axios.get(url);
    return parseXML(response.data);
  } catch (error) {
    console.error(`Error fetching/parsing XML from ${url}:`, error.message);
    throw error;
  }
};

// Find product sitemap URL from sitemap index
const findProductSitemapUrl = (sitemapIndex) => {
  const sitemaps = sitemapIndex.sitemapindex.sitemap || [];
  return sitemaps
    .find(sitemap => sitemap.loc[0].includes("sitemap_products_1"))
    ?.loc[0];
};

/**
 * Extract product URLs from sitemap
 * @param {Object} sitemap - XML sitemap object
 * @returns {Array} - array of product URLs
 */
const extractProductUrls = (sitemap) => {
  const urls = sitemap.urlset.url || [];
  return urls.map(url => url.loc[0]);
};

/**
 * Transform product URL to API URL and extract filename
 * @param {string} url - product URL
 * @returns {Object} - contains apiUrl and filename
 */
const transformProductUrl = (url) => ({
  apiUrl: isHtmlMode ? url : `${url}.js`,
  filename: url.split("/").pop()
});

// Fetch and save product data
const fetchAndSaveProduct = async ({ apiUrl, filename }) => {
  try {
    const response = await axios.get(apiUrl);
    const cleanFilename = filename.replace(/\.[^/.]+$/, "");
    const ext = isHtmlMode ? ".html" : ".json";
    const filepath = path.join(outputfolder, `${cleanFilename}${ext}`);
    fs.writeFileSync(filepath, isHtmlMode ? response.data : JSON.stringify(response.data, null, 2));
    console.log(`Successfully saved: ${filepath}`);
  } catch (error) {
    console.error(`Error processing ${apiUrl}:`, error.message);
  }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution flow
const processSitemap = async (sitemapUrl) => {
  try {
    // Fetch and parse main sitemap
    const sitemapIndex = await fetchXMLContent(sitemapUrl);

    // Find product sitemap URL
    const productSitemapUrl = findProductSitemapUrl(sitemapIndex);
    if (!productSitemapUrl) {
      throw new Error("Product sitemap URL not found");
    }

    // Fetch and parse product sitemap
    const productSitemap = await fetchXMLContent(productSitemapUrl);

    // Process each product URL
    const productUrls = extractProductUrls(productSitemap)
      .map(transformProductUrl)
      .filter(obj => obj.filename !== "");

    console.log(`Found ${productUrls.length} product URL(s).`);
    // Process products in parallel with concurrency limit
    const concurrencyLimit = 3;
    let breakLimit = 0;
    for (let i = 0; i < productUrls.length; i += concurrencyLimit) {
      const batch = productUrls.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map(fetchAndSaveProduct));
      await sleep(100);
      breakLimit++;
      // if (breakLimit === 1) break;
    }

    console.log("All products processed successfully");
  } catch (error) {
    console.error("Error in processSitemap:", error.message);
    throw error;
  }
};

// Export functions for potential reuse
module.exports = {
  processSitemap,
  fetchXMLContent,
  findProductSitemapUrl,
  extractProductUrls,
  transformProductUrl,
  fetchAndSaveProduct
};

// Execute if run directly
// node shopify.js "https://fusionworld.com/sitemap.xml"
if (require.main === module) {
  const sitemapUrl = process.argv[2] || "https://fusionworld.com/sitemap.xml";
  if (!sitemapUrl) {
    console.error("Please provide a sitemap URL as an argument");
    process.exit(1);
  }

  processSitemap(sitemapUrl)
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

"use strict";

import axios from "axios";
import xml2js from "xml2js";
import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { promisify } from "util";

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

// Fetch and save product data
const fetchAndSaveProduct = async ({ apiUrl, filename }, options) => {
  try {
    const response = await axios.get(apiUrl);
    const cleanFilename = filename.replace(/\.[^\/\.]+$/, "");
    const isHtmlMode = options.mode === "html";
    const ext = isHtmlMode ? ".html" : ".json";
    const text = isHtmlMode ? response.data : JSON.stringify(response.data, null, 2);
    const filepath = path.join(options.output, `${cleanFilename}${ext}`);
    writeFileSync(filepath, text);
    console.log(`Successfully saved: ${filepath}`);
  } catch (error) {
    console.error(`Error processing ${apiUrl}:`, error.message);
  }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution flow
const processSitemap = async (sitemapUrl, options) => {
  try {
    // Ensure output folder exists recursively
    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

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
      .map(url => ({
        apiUrl: options.mode === "html" ? url : `${url}.js`,
        filename: url.split("/").pop()
      }))
      .filter(obj => obj.filename !== "");

    console.log(`Found ${productUrls.length} product URL(s).`);

    // Process products in parallel with concurrency limit
    for (let i = 0; i < productUrls.length; i += options.batchLimit) {
      const batch = productUrls.slice(i, i + options.batchLimit);
      await Promise.all(batch.map(product => fetchAndSaveProduct(product, options)));
      await sleep(150);
    }

    console.log("All products processed successfully");
  } catch (error) {
    console.error("Error in processSitemap:", error.message);
    throw error;
  }
};

export function doAction(sitemapUrl, options) {
  const resolvedOptions = {
    output: path.resolve(options.output),
    mode: options.mode,
    batchLimit: parseInt(options.batchLimit, 10)
  };

  if (!["json", "html"].includes(resolvedOptions.mode)) {
    console.error("✗ Invalid mode. Use 'json' or 'html'.");
    process.exit(1);
  }

  processSitemap(sitemapUrl, resolvedOptions)
    .catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
